/**
 * @file app/(main)/page.tsx
 * @description Halaman utama — Hero Section Bento Grid 12-kolom editorial modern.
 *
 * Layout Hero (Desktop lg:grid-cols-12):
 *   ┌──────────────────┬──────────────────────────┬────────────────┐
 *   │ col-span-4       │      col-span-5          │  col-span-3    │
 *   │ Lookbook +       │  Clean Centerpiece +     │  2 Campaign    │
 *   │ Curated Brands   │  Showcase Grid           │  Cards         │
 *   └──────────────────┴──────────────────────────┴────────────────┘
 *
 * Aturan: Tidak ada emoji. Semua ikon dari lucide-react.
 * Semua gambar menggunakan <img> standar (bukan next/image).
 */

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Truck,
  ShieldCheck,
  Headphones,
  Sparkles,
} from "lucide-react";
import { getProducts } from "@/actions/product.actions";
import { ProductGrid } from "@/components/product/product-grid";

// Revalidate setiap 60 detik — hindari force-dynamic agar tidak
// memicu Function Invocation pada SETIAP request (bot/crawler/user).
export const revalidate = 60;

export default async function HomePage() {
  const { data: products } = await getProducts({
    page: 1,
    limit: 8,
    sortBy: "newest",
  });

  return (
    <>
      {/* ============================================================
          HERO SECTION — Bento Grid 12-Kolom Editorial Modern
          ============================================================ */}
      <section className="relative overflow-hidden bg-slate-50">
        {/* Background pola grid halus */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid min-h-[520px] grid-cols-1 items-stretch gap-4 lg:grid-cols-12">

            {/* ==================================================================
                KOLOM KIRI (col-span-4) — Editorial Lookbook & Curated Brands
                ================================================================== */}
            <div className="hidden lg:col-span-4 lg:block">
              <div className="grid h-full grid-cols-2 gap-4">

                {/* ---- Kartu Lookbook Utama (row-span-2) ---- */}
                <div className="group relative row-span-2 overflow-hidden rounded-2xl shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                    alt="Pria bergaya kasual modern"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Teks label */}
                  <div className="absolute bottom-0 left-0 p-5">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-white/80">
                      Men&apos;s Collection
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Autumn Essentials
                    </p>
                  </div>
                </div>

                {/* ---- 3 Kartu Brand Eksklusif ---- */}
                {[
                  { name: "SHOP AT VELVET", category: "Womenswear" },
                  { name: "OTHMAN", category: "Minimalist" },
                  { name: "MERCH\u00C9", category: "Artisan Bags" },
                ].map((brand) => (
                  <div
                    key={brand.name}
                    className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm transition-all duration-300 hover:border-blue-900 hover:bg-blue-950"
                  >
                    {/* Kategori + ikon arrow */}
                    <div className="flex items-start justify-between">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 transition-colors duration-300 group-hover:text-slate-400">
                        {brand.category}
                      </p>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                    </div>
                    {/* Nama brand */}
                    <p className="mt-auto text-lg font-black tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-white">
                      {brand.name}
                    </p>
                  </div>
                ))}

                {/* ---- Kartu Parfum & Aksesoris (col-span-2) ---- */}
                <div className="group relative col-span-2 flex h-36 items-end overflow-hidden rounded-2xl shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80"
                    alt="Koleksi parfum dan aksesoris artisan"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10 flex w-full items-end justify-between p-5">
                    <div>
                      <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                        Exclusive Drop
                      </span>
                      <p className="mt-1.5 text-sm font-semibold text-white">
                        Hijack Sandals & Artisan Scents
                      </p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors group-hover:bg-white/30">
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================================
                KOLOM TENGAH (col-span-5) — Clean Centerpiece & Showcase
                ================================================================== */}
            <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 p-5 text-center shadow-sm backdrop-blur-sm sm:p-8 lg:col-span-5">
              {/* Dekorasi background halus */}
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-slate-100/80 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-50/60 blur-3xl" />

              {/* ---- Bagian Atas: Copywriting ---- */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Badge kapsul */}
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                  </span>
                  Koleksi Baru Tersedia
                </div>

                {/* Headline */}
                <h1 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-blue-950 sm:text-3xl md:text-4xl lg:text-5xl lg:leading-[1.12]">
                  Belanja Online <br />
                  <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-950 bg-clip-text text-transparent">
                    Mudah & Terpercaya
                  </span>
                </h1>

                {/* Subheading */}
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
                  Kurasi produk fashion, elektronik, dan kebutuhan harian
                  terbaik dari brand lokal & resmi. Pengiriman instan ke seluruh
                  Indonesia.
                </p>

                {/* CTA Button */}
                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg active:scale-[0.97] sm:px-7 sm:py-3.5"
                >
                  Jelajahi Katalog
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              {/* ---- Bagian Bawah: Aesthetic Showcase Grid ---- */}
              <div className="relative z-10 mt-6 grid w-full grid-cols-2 gap-3 sm:mt-8 sm:gap-3.5">
                {/* Kartu Skincare & Beauty */}
                <div className="group relative h-28 overflow-hidden rounded-2xl shadow-sm sm:h-36">
                  <img
                    src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
                    alt="Skincare dan produk kecantikan"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-xs font-semibold text-white">
                      Beauty Care
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/70">
                      Diskon s/d 40%
                    </p>
                  </div>
                </div>

                {/* Kartu Modern Apparel */}
                <div className="group relative h-28 overflow-hidden rounded-2xl shadow-sm sm:h-36">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Model fashion modern"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-xs font-semibold text-white">
                      New Lookbook
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/70">
                      Edisi Terbatas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================================
                KOLOM KANAN (col-span-3) — 2 Campaign Cards
                ================================================================== */}
            <div className="hidden flex-col gap-4 lg:col-span-3 lg:flex">

              {/* ---- Kartu 1: LAPAKKU Mall (Official Store) ---- */}
              <div className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-6 text-white shadow-md">
                {/* Foto produk sebagai background visual */}
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                  alt="Sepatu sneakers"
                  className="absolute bottom-0 right-0 h-full w-3/4 object-cover object-left opacity-20 transition-opacity duration-500 group-hover:opacity-30"
                  style={{
                    maskImage: "linear-gradient(to left, black 30%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to left, black 30%, transparent 100%)",
                  }}
                />
                {/* Dekorasi blur */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/15 blur-2xl" />

                {/* Konten */}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-300 backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3" />
                    Official Store
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-lg font-bold text-white">
                    LAPAKKU Mall
                  </h3>
                  <p className="text-2xl font-black text-orange-400">100% ORI</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    Garansi uang kembali & produk resmi
                  </p>
                </div>
              </div>

              {/* ---- Kartu 2: Modest & Lifestyle Promo ---- */}
              <div className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl shadow-md">
                {/* Foto background editorial */}
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80"
                  alt="Koleksi busana modest fashion"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay gradasi gelap hangat */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/85 to-blue-900/40" />

                {/* Konten atas */}
                <div className="relative z-10 p-6">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-[11px] font-semibold text-orange-300 backdrop-blur-md">
                    <Sparkles className="h-3 w-3" />
                    SPESIAL PROMO
                  </span>
                </div>

                {/* Konten bawah */}
                <div className="relative z-10 p-6 pt-0">
                  <h3 className="text-lg font-bold leading-snug text-white">
                    LAPAKKU Barokah
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-300">
                    Kurasi Busana & Kebutuhan Pilihan
                  </p>
                  <span className="mt-3 inline-block rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm">
                    DISKON S.D. 80% + VOUCHER 100RB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Mobile: Banner Promo (terlihat di bawah CTA) ---- */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {/* Mall Banner - Mobile */}
            <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-5 text-white">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"
                alt="Sepatu sneakers"
                className="absolute inset-0 h-full w-full object-cover opacity-15"
              />
              <div className="relative z-10">
                <div className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-orange-300">
                  <ShieldCheck className="h-3 w-3" />
                  Official Store
                </div>
                <h3 className="text-base font-bold">LAPAKKU Mall</h3>
                <p className="text-xl font-black text-orange-400">100% ORI</p>
              </div>
            </div>

            {/* Barokah Banner - Mobile */}
            <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl p-5 text-white">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80"
                alt="Koleksi modest fashion"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 to-blue-900/60" />
              <div className="relative z-10">
                <div className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-orange-300">
                  <Sparkles className="h-3 w-3" />
                  SPESIAL PROMO
                </div>
                <h3 className="text-base font-bold">LAPAKKU Barokah</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Diskon s.d. 80%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION
          ============================================================ */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-gray-200 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-0">
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
              <feature.icon className="h-6 w-6 shrink-0 text-blue-900" />
              <div>
                <p className="text-sm font-semibold text-blue-950">
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
              <h2 className="text-2xl font-bold text-blue-950 sm:text-3xl">
                Produk Terbaru
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Koleksi produk terbaru pilihan untuk Anda.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-medium text-blue-900 transition-colors hover:text-orange-500 sm:inline-flex"
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
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-900 transition-colors hover:text-orange-500"
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
