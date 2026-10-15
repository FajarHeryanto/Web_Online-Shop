import { Metadata } from "next";
import Image from "next/image";
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
import { formatRupiah } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pesanan Saya | Toko Online",
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
    badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800",
    icon: Clock,
  },
  [OrderStatus.PAID]: {
    label: "Sudah Dibayar",
    badgeClass: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
    icon: CreditCard,
  },
  [OrderStatus.SHIPPED]: {
    label: "Sedang Dikirim",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    icon: Truck,
  },
  [OrderStatus.COMPLETED]: {
    label: "Selesai",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  [OrderStatus.CANCELLED]: {
    label: "Dibatalkan",
    badgeClass: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    icon: XCircle,
  },
};

/**
 * Format tanggal dalam Bahasa Indonesia.
 */
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Pesanan Saya
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pantau status pengiriman dan riwayat transaksi belanja Anda
            </p>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Total {orders.length} pesanan
          </div>
        </div>

        {/* State Kosong (Belum ada pesanan) */}
        {orders.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Belum Ada Pesanan
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Anda belum pernah melakukan pemesanan apapun. Temukan berbagai produk menarik dan mulailah berbelanja sekarang.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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
                badgeClass: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
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
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Header Kartu: No. Pesanan, Tanggal, & Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        No. Pesanan
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                        {order.orderNumber}
                      </span>
                      <div className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.badgeClass}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Isi Kartu: Daftar Item Produk */}
                  <div className="divide-y divide-slate-100 px-6 dark:divide-slate-800/80">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col py-4 sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {/* Gambar Produk */}
                          <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                            {item.product?.imageUrl ? (
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                width={72}
                                height={72}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                          </div>

                          {/* Informasi Produk */}
                          <div className="space-y-1">
                            <h4 className="font-semibold text-slate-900 transition-colors dark:text-slate-100">
                              {item.product?.name ?? "Produk"}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.quantity} x {formatRupiah(item.price)}
                            </p>
                          </div>
                        </div>

                        {/* Subtotal Item */}
                        <div className="text-right sm:self-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                            Subtotal:
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formatRupiah(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Kartu: Ringkasan Total & Aksi */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 bg-slate-50/30 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>Total Pesanan ({totalItemsCount} produk):</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {formatRupiah(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {status === OrderStatus.PENDING && (
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-yellow-700 shadow-xs"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Bayar Sekarang</span>
                        </Link>
                      )}
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 dark:hover:text-white"
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
