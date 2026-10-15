/**
 * @file app/api/checkout/route.ts
 * @description API Route Handler untuk proses checkout.
 *
 * Alur lengkap:
 *   1. Terima data pesanan dari client (items, nama, email, phone, alamat)
 *   2. Validasi session user (harus login)
 *   3. Validasi stok produk di database
 *   4. Hitung ulang total di server (jangan percaya client)
 *   5. Buat Order + OrderItems dalam transaksi database
 *   6. Kurangi stok produk
 *   7. Panggil Midtrans Snap API → dapatkan snap token
 *   8. Simpan paymentToken ke Order
 *   9. Return snap token ke client → client buka popup pembayaran
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { createSnapTransaction } from "@/lib/midtrans";

// ============================================================
// REQUEST BODY TYPE
// ============================================================

interface CheckoutRequestBody {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
}

// ============================================================
// POST /api/checkout
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // ---- 1. Validasi Session ----
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    // ---- 2. Parse & Validasi Request Body ----
    const body: CheckoutRequestBody = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Keranjang belanja kosong." },
        { status: 400 }
      );
    }

    if (!body.customerName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama pembeli harus diisi." },
        { status: 400 }
      );
    }

    if (!body.customerEmail?.trim()) {
      return NextResponse.json(
        { success: false, error: "Email pembeli harus diisi." },
        { status: 400 }
      );
    }

    if (!body.shippingAddress?.trim()) {
      return NextResponse.json(
        { success: false, error: "Alamat pengiriman harus diisi." },
        { status: 400 }
      );
    }

    // ---- 3. Transaksi Database (Atomic) ----
    const order = await prisma.$transaction(async (tx) => {
      // 3a. Ambil & validasi semua produk
      const productIds = body.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Validasi setiap item
      for (const item of body.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Produk tidak ditemukan: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Stok "${product.name}" tidak cukup. Tersisa ${product.stock}, diminta ${item.quantity}.`
          );
        }
      }

      // 3b. Hitung total di server (snapshot harga dari DB, bukan dari client)
      const serverTotalAmount = body.items.reduce((sum, item) => {
        const product = productMap.get(item.productId)!;
        return sum + product.price * item.quantity;
      }, 0);

      // 3c. Buat Order + OrderItems
      const orderNumber = generateOrderNumber();

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          totalAmount: serverTotalAmount,
          status: "PENDING",
          shippingAddress: body.shippingAddress.trim(),
          items: {
            create: body.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price, // Snapshot harga saat beli
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

      // 3d. Kurangi stok produk
      await Promise.all(
        body.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      return newOrder;
    });

    // ---- 4. Panggil Midtrans Snap API ----
    const { token: snapToken, redirectUrl } = await createSnapTransaction({
      orderId: order.orderNumber,
      grossAmount: order.totalAmount,
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.trim(),
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    // ---- 5. Simpan payment token ke Order ----
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentToken: snapToken },
    });

    // ---- 6. Return snap token ke client ----
    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        snapToken,
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("[POST /api/checkout] Error:", error);

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan server.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
