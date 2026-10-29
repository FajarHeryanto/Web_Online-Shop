/**
 * @file app/(main)/orders/page.tsx
 * @description Halaman "Pesanan Saya" — daftar pesanan + tombol batalkan.
 *
 * Server Component yang merender daftar pesanan.
 * Tombol "Batalkan Pesanan" dihandle oleh Client Component terpisah.
 */

import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  CreditCard,
  ChevronRight,
  Calendar,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/actions/order.actions";
import { OrderStatus, type OrderWithItems } from "@/types";
import { formatRupiah, formatDateTimeWIB } from "@/lib/utils";
import { CancelOrderButton } from "./cancel-order-button";

// Data pesanan memerlukan session — selalu di-render saat request.
// Tetap dynamic karena route ini dilindungi middleware (hanya user login yang masuk),
// sehingga tidak bisa diakses oleh bot/crawler.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pesanan Saya | LAPAKKU",
  description: "Daftar dan status pesanan belanja Anda.",
};

/**
 * Konfigurasi tampilan status pesanan (label bahasa Indonesia dan warna badge).
 */
const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    badgeClass: string;
    icon: typeof Clock;
  }
> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu Pembayaran",
    badgeClass:
      "bg-yellow-50 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  [OrderStatus.PAID]: {
    label: "Sudah Dibayar",
    badgeClass:
      "bg-green-50 text-green-800 border-green-200",
    icon: CreditCard,
  },
  [OrderStatus.SHIPPED]: {
    label: "Sedang Dikirim",
    badgeClass:
      "bg-blue-50 text-blue-800 border-blue-200",
    icon: Truck,
  },
  [OrderStatus.COMPLETED]: {
    label: "Selesai",
    badgeClass:
      "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  [OrderStatus.CANCELLED]: {
    label: "Dibatalkan",
    badgeClass:
      "bg-red-50 text-red-800 border-red-200",
    icon: XCircle,
  },
};

export default async function OrdersPage() {
  // 1. Cek sesi login di server
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  // 2. Ambil daftar pesanan milik user
  const orderResponse = await getUserOrders(session.user.id);
  const orders: OrderWithItems[] = orderResponse.data || [];

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Halaman */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Pesanan Saya
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pantau status pengiriman dan riwayat transaksi belanja Anda
            </p>
          </div>
          <div className="text-sm font-medium text-slate-600">
            Total {orders.length} pesanan
          </div>
        </div>

        {/* State Kosong (Belum ada pesanan) */}
        {orders.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Belum Ada Pesanan
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Anda belum pernah melakukan pemesanan apapun. Temukan berbagai
              produk menarik dan mulailah berbelanja sekarang.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-md"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Mulai Belanja</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Daftar Kartu Pesanan */
          <div className="space-y-6">
            {orders.map((order) => {
              const status = order.status as OrderStatus;
              const statusInfo = STATUS_CONFIG[status] || {
                label: order.status,
                badgeClass:
                  "bg-slate-100 text-slate-800 border-slate-200",
                icon: Package,
              };
              const StatusIcon = statusInfo.icon;
              const totalItemsCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md"
                >
                  {/* Header Kartu: No. Pesanan, Tanggal, & Status Badge */}
                  <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:py-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                        No. Pesanan
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 sm:text-sm">
                        {order.orderNumber}
                      </span>
                      <div className="hidden h-4 w-px bg-slate-200 sm:block" />
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-xs">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span>{formatDateTimeWIB(order.createdAt)}</span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${statusInfo.badgeClass}`}
                    >
                      <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Isi Kartu: Daftar Item Produk */}
                  <div className="divide-y divide-slate-100 px-4 sm:px-6">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          {/* Gambar Produk */}
                          <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {item.product?.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                          </div>

                          {/* Informasi Produk */}
                          <div className="min-w-0 space-y-1">
                            <h4 className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors">
                              {item.product?.name ?? "Produk"}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {item.quantity} x {formatRupiah(item.price)}
                            </p>
                          </div>
                        </div>

                        {/* Subtotal Item */}
                        <div className="text-right sm:self-center">
                          <p className="text-xs text-slate-500 sm:hidden">
                            Subtotal:
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatRupiah(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Kartu: Ringkasan Total & Aksi */}
                  <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>
                        Total Pesanan ({totalItemsCount} produk):
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {formatRupiah(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {status === OrderStatus.PENDING && (
                        <>
                          <Link
                            href={`/orders/${order.orderNumber}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-yellow-700"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Bayar Sekarang</span>
                          </Link>
                          <CancelOrderButton
                            orderId={order.id}
                            orderNumber={order.orderNumber}
                          />
                        </>
                      )}
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <span>Lihat Detail</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
