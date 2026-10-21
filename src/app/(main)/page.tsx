/**
 * @file app/(main)/page.tsx
 * @description Halaman utama dengan Hero Section CSS Grid 12-kolom.
 *
 * Layout Hero (Desktop lg:grid-cols-12):
 *   ┌──────────────┬─────────────────────┬───────────────┐
 *   │ col-span-4   │    col-span-5       │  col-span-3   │
 *   │ Bento Grid   │  Heading + CTA      │  2 Banner     │
 *   │ Brand+Parfum │  (clean, no overlap)│  Promo Vertikal│
 *   └──────────────┴─────────────────────┴───────────────┘
 *
 * Prinsip: TIDAK ada absolute positioning antar kolom.
 * Setiap zona hidup di grid cell-nya sendiri → tidak saling menutupi.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Headphones } from "lucide-react";
import { getProducts } from "@/actions/product.actions";
import { ProductGrid } from "@/components/product/product-grid";

// Paksa Vercel selalu fetch data terbaru dari DB, bukan cache saat build
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: products } = await getProducts({
    page: 1,
    limit: 8,
    sortBy: "newest",
  });

  return (
    <>
      {/* ============================================================
          HERO SECTION — CSS Grid 12-Kolom (Desktop)
          ============================================================ */}
      <section className="relative overflow-hidden bg-gray-50">
        {/* Background pola grid halus */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* ---- Mobile: Hanya tampil Tengah (CTA) ---- */}
          {/* ---- Desktop: Grid 12 kolom ---- */}
          <div className="grid min-h-[480px] grid-cols-1 items-stretch gap-6 lg:grid-cols-12">

            {/* ==================================================================
                KOLOM KIRI (col-span-4) — Bento Grid: Model Pria, Brand, Parfum
                ================================================================== */}
            <div className="hidden lg:col-span-4 lg:block">
              <div className="grid h-full grid-cols-[1fr_1fr] grid-rows-[1fr_1fr_1fr] gap-3">

                {/* Foto Model Pria — menempati 2 baris kiri */}
                <div className="row-span-2 overflow-hidden rounded-2xl bg-gray-200/80">
                  <div className="relative h-full w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=top"
                      alt="Pria bergaya kasual modern dengan jaket gelap"
                      fill
                      sizes="220px"
                      className="object-cover object-top"
                      priority
                    />
                  </div>
                </div>

                {/* Brand: shop at velvet */}
                <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                  <p className="text-center text-xs font-bold uppercase leading-tight tracking-wider text-gray-800">
                    shop at
                    <br />
                    velvet
                  </p>
                </div>

                {/* Brand: Othman */}
                <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                  <p className="text-center text-xs font-bold uppercase leading-tight tracking-wider text-gray-800">
                    Othman
                  </p>
                </div>

                {/* Parfum di atas podium silinder */}
                <div className="flex flex-col items-center justify-end rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 p-3 shadow-sm">
                  <div className="relative mb-1 h-16 w-10 overflow-hidden rounded-md">
                    <Image
                      src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=120&h=200&fit=crop"
                      alt="Parfum estetik"
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  {/* Podium silinder */}
                  <div className="h-8 w-8 rounded-t-full bg-gradient-to-b from-gray-500 to-gray-700" />
                  <div className="h-2 w-10 rounded-b bg-gray-600" />
                </div>

                {/* Brand: merché */}
                <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                  <p className="text-center text-xs font-bold uppercase leading-tight tracking-wider text-gray-800">
                    merché
                  </p>
                </div>

                {/* Brand: HIJACK SANDALS */}
                <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                  <p className="text-center text-xs font-bold uppercase leading-tight tracking-wider text-gray-800">
                    HIJACK
                    <br />
                    SANDALS
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================================
                KOLOM TENGAH (col-span-5) — Heading + CTA (Zona Bersih!)
                ================================================================== */}
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center lg:col-span-5 lg:py-0">

              {/* Badge "Produk baru tersedia" */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Produk baru tersedia
              </div>

              {/* Headline */}
              <h1 className="max-w-lg text-4xl font-extrabold tracking-tight text-slate-900 leading-tight lg:text-5xl">
                Belanja Online{" "}
                <span className="text-slate-500">Mudah &</span>{" "}
                Terpercaya
              </h1>

              {/* Subheadline */}
              <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500">
                Temukan berbagai produk berkualitas dengan harga terbaik.
                Pengiriman cepat ke seluruh Indonesia.
              </p>

              {/* CTA Button */}
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.97]"
                >
                  Lihat Katalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Aksen visual bawah: Model Wanita + Skincare — terkontrol */}
              <div className="mt-8 flex items-end justify-center gap-3">
                {/* Skincare Tubes */}
                <div className="relative hidden h-[90px] w-[130px] overflow-hidden rounded-xl shadow-md sm:block">
                  <Image
                    src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=260&h=180&fit=crop"
                    alt="Produk skincare kecantikan"
                    fill
                    sizes="130px"
                    className="object-cover"
                  />
                </div>

                {/* Model Wanita */}
                <div className="relative h-[140px] w-[100px] overflow-hidden rounded-2xl shadow-lg sm:h-[160px] sm:w-[120px]">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=340&fit=crop&crop=top"
                    alt="Wanita berambut pendek kasual"
                    fill
                    sizes="120px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* ==================================================================
                KOLOM KANAN (col-span-3) — 2 Kartu Promo Vertikal
                ================================================================== */}
            <div className="hidden flex-col gap-6 lg:col-span-3 lg:flex">

              {/* ---- Kartu Atas: TokoOnline Mall 100% ORI ---- */}
              <div className="relative flex flex-1 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white">
                {/* Dekorasi blur */}
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-blue-400/15 blur-xl" />

                {/* Teks */}
                <div className="relative z-10 shrink-0">
                  <h3 className="text-lg font-bold text-white">
                    TokoOnline Mall
                  </h3>
                  <p className="text-2xl font-extrabold text-sky-400">
                    100% ORI
                  </p>
                  <p className="mt-1 text-xs text-blue-200/70">
                    Produk resmi bergaransi
                  </p>
                </div>

                {/* Produk Display — Ponsel + Sepatu */}
                <div className="relative z-10 flex shrink-0 items-end gap-2">
                  {/* Smartphone */}
                  <div className="flex flex-col items-center">
                    <div className="relative h-[60px] w-[36px] overflow-hidden rounded-md bg-white/10 shadow-md">
                      <Image
                        src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=180&fit=crop"
                        alt="Smartphone"
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-0.5 h-3 w-10 rounded bg-blue-800/50" />
                  </div>

                  {/* Sepatu */}
                  <div className="flex flex-col items-center">
                    <div className="relative h-[40px] w-[55px] overflow-hidden rounded-md bg-white/10 shadow-md">
                      <Image
                        src="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=150&h=110&fit=crop"
                        alt="Sepatu kets putih"
                        fill
                        sizes="55px"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-0.5 h-3 w-14 rounded bg-blue-800/50" />
                  </div>
                </div>
              </div>

              {/* ---- Kartu Bawah: TokoOnline Barokah ---- */}
              <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 text-center text-white">
                {/* Motif Geometris */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M20 18v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 18v-4h-2v4h-4v2h4v4h2v-4h4v-2H0z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />

                {/* Dekorasi lingkaran */}
                <div className="absolute -left-10 top-2 h-24 w-24 rounded-full border border-white/5" />
                <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full border border-white/5" />

                {/* Konten */}
                <div className="relative z-10">
                  {/* Icon dekoratif */}
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                    <span className="text-lg">🕌</span>
                  </div>

                  <h3 className="text-lg font-bold leading-snug text-white">
                    TokoOnline Barokah
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-indigo-200">
                    Semua Kebutuhan
                  </p>

                  {/* Promo badge — teks putih bersih tanpa background kuning */}
                  <div className="mt-3 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white">
                      Diskon s.d. 80% | Voucher 100RB
                    </p>
                  </div>

                  {/* Produk preview — ikon tipografi */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {["👔", "👗", "📿"].map((emoji, i) => (
                      <div
                        key={i}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-base"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Mobile: Banner Promo (terlihat di bawah CTA) ---- */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {/* Mall Banner - Mobile */}
            <div className="flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-5 text-white">
              <div>
                <h3 className="text-base font-bold">TokoOnline Mall</h3>
                <p className="text-xl font-extrabold text-sky-400">100% ORI</p>
              </div>
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop"
                  alt="Smartphone"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Barokah Banner - Mobile */}
            <div className="flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 p-5 text-white">
              <div>
                <h3 className="text-base font-bold">TokoOnline Barokah</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Diskon s.d. 80%
                </p>
              </div>
              <span className="text-2xl">🕌</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION
          ============================================================ */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            {
              icon: Truck,
              title: "Pengiriman Cepat",
              desc: "Kirim ke seluruh Indonesia",
            },
            {
              icon: ShieldCheck,
              title: "Pembayaran Aman",
              desc: "Berbagai metode pembayaran",
            },
            {
              icon: Headphones,
              title: "Layanan 24/7",
              desc: "Siap membantu kapan saja",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 px-6 py-5 sm:justify-center"
            >
              <feature.icon className="h-6 w-6 shrink-0 text-gray-700" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {feature.title}
                </p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          PRODUCT SECTION
          ============================================================ */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Produk Terbaru
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Koleksi produk terbaru pilihan untuk Anda.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:inline-flex"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            <ProductGrid products={products} />
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Lihat Semua Produk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
