/**
 * @file app/(main)/cart/page.tsx
 * @description Halaman keranjang belanja ("Keranjang Belanja") e-commerce.
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Package,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydration guard: hindari perbedaan render SSR dan CSR dari localStorage
  if (!isMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Hitung total item & total harga
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Tampilan ketika keranjang kosong
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Keranjang Belanja Kosong
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Anda belum menambahkan produk ke dalam keranjang belanja.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Halaman */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Lanjut Belanja
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Keranjang Belanja
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Apakah Anda yakin ingin mengosongkan seluruh keranjang?"
                )
              ) {
                clearCart();
              }
            }}
            className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-gray-500 transition-colors hover:text-red-600 sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Kosongkan Keranjang
          </button>
        )}
      </div>

      {/* Grid Konten Utama: 3/5 Daftar Produk, 2/5 Ringkasan Sidebar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Kolom Kiri: Daftar Produk (3/5) */}
        <div className="space-y-4 lg:col-span-3">
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <ShoppingBag className="h-5 w-5 text-gray-400" />
                Daftar Produk
                <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {totalItems} item
                </span>
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-4 sm:p-5"
                >
                  {/* Foto Produk */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Informasi Produk & Kontrol */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-gray-700 hover:underline sm:text-base"
                        >
                          {item.name}
                        </Link>
                        {/* Tombol Hapus Item */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-gray-400 transition-colors hover:text-red-500"
                          title="Hapus dari keranjang"
                          aria-label={`Hapus ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        {formatRupiah(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-50 pt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => decrementItem(item.productId)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 active:scale-95"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addItem({ ...item, quantity: 1 })}
                          disabled={item.quantity >= item.stock}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>

                        {item.quantity >= item.stock && (
                          <span className="ml-2 text-xs text-amber-600">
                            (Maks. stok)
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="block text-xs text-gray-400 sm:hidden">
                          Subtotal
                        </span>
                        <p className="text-sm font-semibold text-gray-900 sm:text-base">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Ringkasan Belanja Sidebar (2/5) */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5 shadow-xs sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Ringkasan Belanja
            </h2>

            {/* Rincian Harga */}
            <div className="space-y-3 border-b border-gray-100 pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({totalItems} item)
                </span>
                <span className="font-medium text-gray-900">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pengiriman</span>
                <span className="font-medium text-green-600">
                  Gratis Ongkir
                </span>
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="flex items-center justify-between py-4">
              <span className="text-base font-semibold text-gray-900">
                Total
              </span>
              <span className="text-xl font-bold text-gray-900">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            {/* Tombol Lanjut ke Pembayaran */}
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-gray-800 active:scale-[0.98]"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Info Tambahan */}
            <p className="mt-4 text-center text-xs text-gray-500">
              Transaksi aman dengan Midtrans Payment Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
