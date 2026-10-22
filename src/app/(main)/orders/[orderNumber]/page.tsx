/**
 * @file app/(main)/orders/[orderNumber]/page.tsx
 * @description Halaman detail pesanan — menampilkan info lengkap satu pesanan.
 *
 * Route: /orders/ORD-20261022-XXXXX
 * Menggunakan orderNumber (bukan UUID internal) sebagai parameter URL.
 */

import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  CreditCard,
  ArrowLeft,
  Calendar,
  MapPin,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getOrderByNumber } from "@/actions/order.actions";
import { OrderStatus } from "@/types";
import { formatRupiah, formatDateTimeWIB } from "@/lib/utils";
import { CancelOrderButton } from "../cancel-order-button";

export const dynamic = "force-dynamic";

/**
 * Konfigurasi tampilan status pesanan.
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
    badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  [OrderStatus.PAID]: {
    label: "Sudah Dibayar",
    badgeClass: "bg-green-50 text-green-800 border-green-200",
    icon: CreditCard,
  },
  [OrderStatus.SHIPPED]: {
    label: "Sedang Dikirim",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Truck,
  },
  [OrderStatus.COMPLETED]: {
    label: "Selesai",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  [OrderStatus.CANCELLED]: {
    label: "Dibatalkan",
    badgeClass: "bg-red-50 text-red-800 border-red-200",
    icon: XCircle,
  },
};

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Pesanan ${orderNumber} | LAPAKKU`,
  };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderNumber } = await params;

  // 1. Cek sesi login
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/orders/${orderNumber}`);
  }

  // 2. Ambil data pesanan (divalidasi terhadap userId)
  const result = await getOrderByNumber(orderNumber, session.user.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;
  const status = order.status as OrderStatus;
  const statusInfo = STATUS_CONFIG[status] || {
    label: order.status,
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
    icon: Package,
  };
  const StatusIcon = statusInfo.icon;
  const totalItemsCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pesanan Saya
        </Link>

        {/* Header: Nomor Pesanan & Status */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                No. Pesanan
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-900">
                {order.orderNumber}
              </p>
            </div>
            <div
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold ${statusInfo.badgeClass}`}
            >
              <StatusIcon className="h-4 w-4" />
              <span>{statusInfo.label}</span>
            </div>
          </div>

          {/* Info Meta: Tanggal & Alamat */}
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Tanggal Pesanan
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-700">
                  {formatDateTimeWIB(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Alamat Pengiriman
                </p>
                <p className="mt-0.5 text-sm text-slate-700">
                  {order.shippingAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Produk */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Daftar Produk ({totalItemsCount} item)
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                {/* Gambar */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.product?.slug || ""}`}
                    className="text-sm font-semibold text-slate-900 hover:underline"
                  >
                    {item.product?.name ?? "Produk"}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.quantity} x {formatRupiah(item.price)}
                  </p>
                </div>

                {/* Subtotal */}
                <p className="shrink-0 text-sm font-semibold text-slate-900">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4">
            <span className="text-sm font-medium text-slate-600">
              Total Pembayaran
            </span>
            <span className="text-xl font-bold text-slate-900">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap items-center gap-3">
          {status === OrderStatus.PENDING && (
            <>
              <Link
                href={`/orders/${order.orderNumber}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-yellow-700"
              >
                <CreditCard className="h-4 w-4" />
                Bayar Sekarang
              </Link>
              <CancelOrderButton
                orderId={order.id}
                orderNumber={order.orderNumber}
              />
            </>
          )}
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
