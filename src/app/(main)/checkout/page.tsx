/**
 * @file app/checkout/page.tsx
 * @description Halaman checkout — ringkasan belanjaan, form pembeli, & pembayaran Midtrans.
 *
 * Alur UX:
 *   1. User melihat ringkasan item dari Zustand cart store
 *   2. User mengisi form data pembeli (Nama, Email, No. HP, Alamat)
 *   3. Klik "Bayar Sekarang"
 *   4. Frontend POST ke /api/checkout → dapat snap token
 *   5. window.snap.pay(token) → popup Midtrans muncul
 *   6. User menyelesaikan pembayaran di popup
 *   7. Callback onSuccess → keranjang dikosongkan, redirect ke success page
 *
 * Proteksi:
 *   Route ini dilindungi middleware → user HARUS login.
 *   Jika belum login, otomatis redirect ke /login?callbackUrl=/checkout.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Cart state
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const clearCart = useCartStore((s) => s.clearCart);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSnapReady, setIsSnapReady] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Hydration guard — cart data from localStorage only available after mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pre-fill form dari session
  useEffect(() => {
    if (session?.user) {
      setCustomerName(session.user.name || "");
      setCustomerEmail(session.user.email || "");
    }
  }, [session]);

  // Hitung total
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ---- Handle Checkout ----
  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validasi client-side
    if (items.length === 0) {
      setError("Keranjang belanja kosong.");
      return;
    }
    if (!customerName.trim()) {
      setError("Nama pembeli harus diisi.");
      return;
    }
    if (!customerEmail.trim()) {
      setError("Email pembeli harus diisi.");
      return;
    }
    if (!shippingAddress.trim()) {
      setError("Alamat pengiriman harus diisi.");
      return;
    }

    if (!isSnapReady || !window.snap) {
      setError("Sistem pembayaran belum siap. Tunggu sebentar lalu coba lagi.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Kirim ke API checkout
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Checkout gagal.");
        setIsLoading(false);
        return;
      }

      // 2. Buka popup Midtrans Snap
      window.snap.pay(result.data.snapToken, {
        onSuccess: () => {
          setOrderNumber(result.data.orderNumber);
          setIsSuccess(true);
          clearCart();
        },
        onPending: () => {
          setOrderNumber(result.data.orderNumber);
          setIsSuccess(true);
          clearCart();
        },
        onError: () => {
          setError(
            "Pembayaran gagal. Silakan coba lagi atau hubungi customer service."
          );
        },
        onClose: () => {
          // User menutup popup tanpa membayar — tidak lakukan apa-apa
          // Order sudah dibuat di DB dengan status PENDING
        },
      });
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  // ---- Render: Loading (hydration guard) ----
  if (!isMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ---- Render: Success ----
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Pesanan Berhasil Dibuat!
        </h1>
        <p className="mt-3 text-gray-500">
          Nomor pesanan Anda:{" "}
          <span className="font-mono font-semibold text-gray-900">
            {orderNumber}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Terima kasih telah berbelanja di TokoOnline.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            <Package className="h-4 w-4" />
            Lihat Pesanan Saya
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    );
  }

  // ---- Render: Keranjang Kosong ----
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-900">
          Keranjang Belanja Kosong
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Anda belum menambahkan produk ke keranjang.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Mulai Belanja
        </Link>
      </div>
    );
  }

  // ---- Render: Checkout Form ----
  return (
    <>
      {/* Midtrans Snap.js Script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
        onReady={() => setIsSnapReady(true)}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali belanja
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            Checkout
          </h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleCheckout}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* ====================================================
                LEFT: Daftar Belanjaan + Form Pembeli (3/5 width)
                ==================================================== */}
            <div className="space-y-6 lg:col-span-3">
              {/* ---- Ringkasan Item ---- */}
              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                    Ringkasan Belanjaan
                    <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {totalItems} item
                    </span>
                  </h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 px-5 py-4"
                    >
                      {/* Gambar */}
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

                      {/* Info */}
                      <div className="flex flex-1 flex-col">
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-sm font-medium text-gray-900 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {formatRupiah(item.price)} / item
                        </p>

                        {/* Quantity Controls */}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => decrementItem(item.productId)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50"
                              aria-label="Kurangi"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => addItem({ ...item, quantity: 1 })}
                              disabled={item.quantity >= item.stock}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Tambah"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatRupiah(item.price * item.quantity)}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="text-gray-400 transition-colors hover:text-red-500"
                              aria-label={`Hapus ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ---- Form Data Pembeli ---- */}
              <section className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  Data Pembeli & Pengiriman
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Nama */}
                  <div>
                    <label
                      htmlFor="customerName"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama lengkap penerima"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="customerEmail"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  {/* No. HP */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="customerPhone"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      No. HP
                    </label>
                    <input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  {/* Alamat */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="shippingAddress"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Alamat Pengiriman <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="shippingAddress"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos"
                      required
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ====================================================
                RIGHT: Ringkasan Pembayaran (2/5 width, sticky)
                ==================================================== */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  Ringkasan Pembayaran
                </h2>

                {/* Detail Harga */}
                <div className="space-y-3 border-b border-gray-100 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal ({totalItems} item)
                    </span>
                    <span className="text-gray-900">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ongkos Kirim</span>
                    <span className="font-medium text-green-600">Gratis</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between py-4">
                  <span className="text-base font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>

                {/* Tombol Bayar */}
                <button
                  type="submit"
                  disabled={isLoading || !isSnapReady}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses Pesanan...
                    </>
                  ) : !isSnapReady ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat Pembayaran...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Bayar Sekarang
                    </>
                  )}
                </button>

                {/* Info Keamanan */}
                <p className="mt-3 text-center text-xs text-gray-400">
                  🔒 Pembayaran diproses secara aman oleh Midtrans
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
