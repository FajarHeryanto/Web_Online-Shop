/**
 * @file app/api/webhook/midtrans/route.ts
 * @description Webhook endpoint untuk menerima notifikasi pembayaran dari Midtrans.
 *
 * Alur:
 *   1. Midtrans mengirim POST request saat status pembayaran berubah.
 *   2. Server memverifikasi signature_key untuk memastikan request asli dari Midtrans.
 *   3. Berdasarkan transaction_status, update status Order di database:
 *      - "capture" / "settlement" → PAID
 *      - "pending"               → PENDING (tidak berubah)
 *      - "deny" / "cancel" / "expire" / "failure" → CANCELLED
 *   4. Jika status CANCELLED, kembalikan stok produk yang sudah dikurangi saat checkout.
 *
 * URL Webhook yang harus di-set di Midtrans Dashboard:
 *   Production: https://infotugas.web.id/api/webhook/midtrans
 *   Sandbox:    https://infotugas.web.id/api/webhook/midtrans
 *
 * Dokumentasi: https://docs.midtrans.com/docs/https-notification
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySignature } from "@/lib/midtrans";

// ============================================================
// TYPE — Notifikasi dari Midtrans
// ============================================================

interface MidtransNotificationPayload {
  transaction_status:
    | "capture"
    | "settlement"
    | "pending"
    | "deny"
    | "cancel"
    | "expire"
    | "failure";
  order_id: string;
  gross_amount: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  fraud_status?: "accept" | "deny" | "challenge";
}

// ============================================================
// POST /api/webhook/midtrans
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Parse body dari Midtrans
    const body: MidtransNotificationPayload = await request.json();

    console.log("[Midtrans Webhook] Received:", {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      status_code: body.status_code,
      payment_type: body.payment_type,
    });

    // 2. Validasi field yang dibutuhkan
    if (
      !body.order_id ||
      !body.status_code ||
      !body.gross_amount ||
      !body.signature_key
    ) {
      console.error("[Midtrans Webhook] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. Verifikasi signature — pastikan request benar dari Midtrans
    const isValid = await verifySignature(
      body.order_id,
      body.status_code,
      body.gross_amount,
      body.signature_key
    );

    if (!isValid) {
      console.error("[Midtrans Webhook] Invalid signature for:", body.order_id);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // 4. Cari order berdasarkan orderNumber (Midtrans order_id = our orderNumber)
    const order = await prisma.order.findUnique({
      where: { orderNumber: body.order_id },
      include: {
        items: true,
      },
    });

    if (!order) {
      console.error("[Midtrans Webhook] Order not found:", body.order_id);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 5. Tentukan status baru berdasarkan transaction_status
    let newStatus: string;

    switch (body.transaction_status) {
      case "capture":
        // Untuk kartu kredit: cek fraud_status
        newStatus =
          body.fraud_status === "accept" || !body.fraud_status
            ? "PAID"
            : "PENDING";
        break;

      case "settlement":
        // Pembayaran berhasil (bank transfer, e-wallet, dll)
        newStatus = "PAID";
        break;

      case "pending":
        // Menunggu pembayaran
        newStatus = "PENDING";
        break;

      case "deny":
      case "cancel":
      case "expire":
      case "failure":
        // Pembayaran gagal/dibatalkan/expired
        newStatus = "CANCELLED";
        break;

      default:
        console.warn(
          "[Midtrans Webhook] Unknown transaction_status:",
          body.transaction_status
        );
        newStatus = order.status; // Tidak berubah
    }

    // 6. Jangan update jika status sudah sama atau order sudah final
    if (order.status === newStatus) {
      console.log(
        `[Midtrans Webhook] Order ${body.order_id} sudah berstatus ${newStatus}. Skip.`
      );
      return NextResponse.json({ status: "ok", message: "No update needed" });
    }

    // Jangan update jika order sudah di status final (PAID, COMPLETED, CANCELLED)
    if (["PAID", "COMPLETED", "CANCELLED"].includes(order.status) && newStatus === "PENDING") {
      console.log(
        `[Midtrans Webhook] Order ${body.order_id} sudah ${order.status}. Tidak bisa kembali ke PENDING.`
      );
      return NextResponse.json({ status: "ok", message: "Order already finalized" });
    }

    // 7. Update status di database
    await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus },
    });

    console.log(
      `[Midtrans Webhook] Order ${body.order_id}: ${order.status} → ${newStatus}`
    );

    // 8. Jika CANCELLED: kembalikan stok produk
    if (newStatus === "CANCELLED" && order.status === "PENDING") {
      await Promise.all(
        order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
      console.log(
        `[Midtrans Webhook] Stok dikembalikan untuk order ${body.order_id}`
      );
    }

    // 9. Return OK ke Midtrans (wajib 200, jika tidak Midtrans akan retry)
    return NextResponse.json({
      status: "ok",
      order_id: body.order_id,
      updated_status: newStatus,
    });
  } catch (error) {
    console.error("[Midtrans Webhook] Error:", error);

    // Tetap return 200 agar Midtrans tidak retry terus-menerus
    // Error akan di-log dan bisa di-investigate manual
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 200 }
    );
  }
}
