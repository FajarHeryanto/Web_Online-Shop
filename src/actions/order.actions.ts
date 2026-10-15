/**
 * @file actions/order.actions.ts
 * @description Server Actions untuk operasi pesanan (Order).
 *
 * Alur pemesanan:
 *   1. Client memanggil `createOrder()` dengan item keranjang + alamat.
 *   2. Server memvalidasi stok, menghitung total, dan membuat Order + OrderItems
 *      dalam satu transaksi database.
 *   3. Stok produk dikurangi secara atomik di dalam transaksi yang sama.
 *   4. Jika berhasil, client melanjutkan ke pembayaran (Midtrans).
 *   5. Webhook Midtrans memanggil `updateOrderStatus()` setelah pembayaran.
 */

"use server";

import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { ORDERS_PER_PAGE } from "@/lib/constants";
import type {
  ApiResponse,
  PaginatedResponse,
  CreateOrderInput,
  OrderWithItems,
} from "@/types";
import { OrderStatus } from "@/types";

// ============================================================
// 1. CREATE ORDER (DENGAN TRANSAKSI DATABASE)
// ============================================================

/**
 * Buat pesanan baru. Proses dalam satu transaksi:
 *   1. Validasi stok semua item
 *   2. Buat record Order
 *   3. Buat record OrderItem (snapshot harga saat beli)
 *   4. Kurangi stok produk
 *
 * @example
 *   const result = await createOrder({
 *     userId: "user-123",
 *     items: [{ productId: "prod-1", quantity: 2, price: 150000 }],
 *     shippingAddress: "Jl. Merdeka No. 10, Jakarta",
 *     totalAmount: 300000,
 *   });
 */
export async function createOrder(
  userId: string,
  input: CreateOrderInput
): Promise<ApiResponse<OrderWithItems>> {
  try {
    // Validasi input dasar
    if (!userId) {
      return { success: false, error: "User ID harus diisi." };
    }
    if (!input.items.length) {
      return { success: false, error: "Pesanan harus memiliki minimal 1 item." };
    }
    if (!input.shippingAddress.trim()) {
      return { success: false, error: "Alamat pengiriman harus diisi." };
    }

    // ---- Transaksi Database (atomic) ----
    const order = await prisma.$transaction(async (tx) => {
      // 1. Ambil & validasi stok semua produk
      const productIds = input.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Cek setiap item
      for (const item of input.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Produk dengan ID "${item.productId}" tidak ditemukan.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Stok "${product.name}" tidak cukup. Tersisa ${product.stock}, diminta ${item.quantity}.`
          );
        }
      }

      // 2. Hitung ulang total di server (jangan percaya client)
      const serverTotalAmount = input.items.reduce((sum, item) => {
        const product = productMap.get(item.productId)!;
        return sum + product.price * item.quantity;
      }, 0);

      // 3. Buat Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          totalAmount: serverTotalAmount,
          status: OrderStatus.PENDING,
          shippingAddress: input.shippingAddress.trim(),
          items: {
            create: input.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                // Snapshot harga saat beli (bukan harga dari client)
                price: product.price,
              };
            }),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // 4. Kurangi stok semua produk
      await Promise.all(
        input.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      return newOrder;
    });

    return { success: true, data: order };
  } catch (error) {
    console.error("[createOrder] Error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal membuat pesanan.";
    return { success: false, error: message };
  }
}

// ============================================================
// 2. GET USER ORDERS (RIWAYAT TRANSAKSI)
// ============================================================

/**
 * Ambil daftar pesanan milik user tertentu.
 *
 * @example
 *   const result = await getUserOrders("user-123", 1);
 */
export async function getUserOrders(
  userId: string,
  page: number = 1
): Promise<PaginatedResponse<OrderWithItems>> {
  const limit = ORDERS_PER_PAGE;
  const skip = (page - 1) * limit;

  const [orders, totalItems] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    data: orders,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}

// ============================================================
// 3. GET ORDER BY ID (DETAIL PESANAN)
// ============================================================

/**
 * Ambil detail pesanan berdasarkan ID.
 * Divalidasi terhadap userId agar user hanya bisa lihat pesanan miliknya.
 *
 * @example
 *   const result = await getOrderById("order-123", "user-456");
 */
export async function getOrderById(
  orderId: string,
  userId?: string
): Promise<ApiResponse<OrderWithItems>> {
  try {
    const where: { id: string; userId?: string } = { id: orderId };

    // Jika userId diberikan, pastikan hanya pemilik yang bisa akses
    if (userId) {
      where.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("[getOrderById] Error:", error);
    return { success: false, error: "Gagal mengambil data pesanan." };
  }
}

// ============================================================
// 4. UPDATE ORDER STATUS (ADMIN / WEBHOOK)
// ============================================================

/**
 * Update status pesanan. Digunakan oleh:
 *   - Admin: mengubah status manual (PAID → SHIPPED → COMPLETED)
 *   - Webhook Midtrans: PENDING → PAID atau CANCELLED
 *
 * @example
 *   await updateOrderStatus("order-123", OrderStatus.PAID);
 *   await updateOrderStatus("order-123", OrderStatus.SHIPPED);
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ApiResponse<OrderWithItems>> {
  try {
    // Validasi transisi status yang diperbolehkan
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!currentOrder) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    if (!isValidStatusTransition(currentOrder.status as OrderStatus, status)) {
      return {
        success: false,
        error: `Tidak bisa mengubah status dari "${currentOrder.status}" ke "${status}".`,
      };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("[updateOrderStatus] Error:", error);
    return { success: false, error: "Gagal mengupdate status pesanan." };
  }
}

// ============================================================
// HELPERS (PRIVATE)
// ============================================================

/**
 * Validasi apakah transisi status pesanan diperbolehkan.
 *
 * Alur valid:
 *   PENDING → PAID → SHIPPED → COMPLETED
 *   PENDING → CANCELLED
 *   PAID → CANCELLED (refund scenario)
 */
function isValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [], // Final state
    [OrderStatus.CANCELLED]: [], // Final state
  };

  return allowedTransitions[current]?.includes(next) ?? false;
}
