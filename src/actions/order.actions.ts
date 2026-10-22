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
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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

// ============================================================
// 5. GET ORDER BY ORDER NUMBER (UNTUK HALAMAN DETAIL)
// ============================================================

/**
 * Ambil detail pesanan berdasarkan orderNumber (ORD-YYYYMMDD-XXXXX).
 * Divalidasi terhadap userId agar user hanya bisa lihat pesanan miliknya.
 */
export async function getOrderByNumber(
  orderNumber: string,
  userId: string
): Promise<ApiResponse<OrderWithItems>> {
  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber, userId },
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
    console.error("[getOrderByNumber] Error:", error);
    return { success: false, error: "Gagal mengambil data pesanan." };
  }
}

// ============================================================
// 6. CANCEL ORDER (PEMBATALAN PESANAN OLEH USER)
// ============================================================

/**
 * Batalkan pesanan milik user. Proses dalam satu transaksi:
 *   1. Validasi: user login & pemilik, status masih PENDING
 *   2. Ubah status → CANCELLED
 *   3. Kembalikan stok produk
 *   4. Batalkan transaksi Midtrans (jika ada)
 *
 * Operasi idempotent: membatalkan pesanan yang sudah CANCELLED tidak error.
 * userId diambil dari server session (bukan dari client) untuk keamanan.
 */
export async function cancelOrder(
  orderId: string
): Promise<ApiResponse<{ orderNumber: string }>> {
  try {
    // Ambil session di server
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Anda harus login terlebih dahulu." };
    }
    const userId = session.user.id;

    // 1. Ambil pesanan dan validasi kepemilikan
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    // Validasi kepemilikan
    if (order.userId !== userId) {
      return { success: false, error: "Anda tidak memiliki akses ke pesanan ini." };
    }

    // Idempotent: jika sudah dibatalkan, kembalikan sukses tanpa efek
    if (order.status === OrderStatus.CANCELLED) {
      return { success: true, data: { orderNumber: order.orderNumber } };
    }

    // Hanya bisa batalkan pesanan PENDING
    if (order.status !== OrderStatus.PENDING) {
      return {
        success: false,
        error: `Pesanan dengan status "${order.status}" tidak dapat dibatalkan.`,
      };
    }

    // 2. Transaksi: update status + kembalikan stok (atomic)
    await prisma.$transaction(async (tx) => {
      // Update status ke CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      // Kembalikan stok semua item
      await Promise.all(
        order.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
    });

    // 3. Batalkan transaksi Midtrans (best-effort, jangan gagalkan pembatalan)
    try {
      await cancelMidtransTransaction(order.orderNumber);
    } catch (midtransError) {
      // Log tapi jangan throw — pembatalan di DB sudah berhasil
      console.warn(
        `[cancelOrder] Gagal batalkan Midtrans untuk ${order.orderNumber}:`,
        midtransError
      );
    }

    return { success: true, data: { orderNumber: order.orderNumber } };
  } catch (error) {
    console.error("[cancelOrder] Error:", error);
    return { success: false, error: "Gagal membatalkan pesanan. Coba lagi." };
  }
}

/**
 * Batalkan transaksi di Midtrans via Cancel API.
 * Endpoint: POST /v2/{order_id}/cancel
 */
async function cancelMidtransTransaction(orderNumber: string): Promise<void> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return;

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";

  const authString = Buffer.from(`${serverKey}:`).toString("base64");

  const response = await fetch(`${baseUrl}/${orderNumber}/cancel`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    // Status 412 = transaction not found / already cancelled — safe to ignore
    if (response.status !== 412) {
      console.warn(`[Midtrans Cancel] ${response.status}: ${body}`);
    }
  }
}
