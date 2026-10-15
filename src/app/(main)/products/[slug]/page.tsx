/**
 * @file app/(main)/products/[slug]/page.tsx
 * @description Halaman detail produk — gambar besar, deskripsi, tombol tambah keranjang.
 *
 * Server Component utama + Client Component interaktif (AddToCartSection).
 *
 * Route: /products/kaos-polos-hitam → slug = "kaos-polos-hitam"
 */

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
} from "lucide-react";
import { getProductBySlug } from "@/actions/product.actions";
import { formatRupiah } from "@/lib/utils";
import { AddToCartSection } from "./add-to-cart-section";

// ============================================================
// METADATA DINAMIS
// ============================================================

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    return { title: "Produk Tidak Ditemukan | Toko Online" };
  }

  return {
    title: `${result.data.name} | Toko Online`,
    description:
      result.data.description || `Beli ${result.data.name} di Toko Online`,
  };
}

// ============================================================
// PAGE COMPONENT
// ============================================================

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/"
            className="transition-colors hover:text-gray-900"
          >
            Beranda
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="transition-colors hover:text-gray-900"
          >
            Katalog
          </Link>
          <span>/</span>
          <span className="truncate font-medium text-gray-900">
            {product.name}
          </span>
        </nav>

        {/* ============================================================
            DETAIL GRID: Gambar (Kiri) + Info (Kanan)
            ============================================================ */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* ---- Gambar Produk ---- */}
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-24 w-24 text-gray-300" />
              </div>
            )}

            {/* Badge Stok Habis */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="rounded-full bg-white px-6 py-2 text-lg font-semibold text-gray-900">
                  Stok Habis
                </span>
              </div>
            )}
          </div>

          {/* ---- Info & Aksi ---- */}
          <div className="flex flex-col">
            {/* Kategori */}
            <span className="mb-2 inline-flex w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
              {product.category}
            </span>

            {/* Nama Produk */}
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            {/* Rating Placeholder */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">4.0 (128 ulasan)</span>
            </div>

            {/* Harga */}
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">
                {formatRupiah(product.price)}
              </p>
            </div>

            {/* Stok Info */}
            <div className="mt-3">
              {isOutOfStock ? (
                <p className="text-sm font-medium text-red-600">
                  ✕ Stok Habis
                </p>
              ) : isLowStock ? (
                <p className="text-sm font-medium text-amber-600">
                  ⚠ Sisa {product.stock} item — segera habis!
                </p>
              ) : (
                <p className="text-sm text-green-600">
                  ✓ Stok tersedia ({product.stock} item)
                </p>
              )}
            </div>

            {/* Deskripsi */}
            {product.description && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">
                  Deskripsi Produk
                </h2>
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* ---- Tambah ke Keranjang (Client Component) ---- */}
            <div className="mt-6">
              <AddToCartSection product={product} />
            </div>

            {/* Keunggulan Belanja */}
            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
              {[
                {
                  icon: Truck,
                  title: "Gratis Ongkir",
                  desc: "Seluruh Indonesia",
                },
                {
                  icon: ShieldCheck,
                  title: "Pembayaran Aman",
                  desc: "Via Midtrans",
                },
                {
                  icon: RotateCcw,
                  title: "Garansi Retur",
                  desc: "7 hari pengembalian",
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-3"
                >
                  <feat.icon className="h-5 w-5 shrink-0 text-gray-500" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {feat.title}
                    </p>
                    <p className="text-[11px] text-gray-500">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Tombol Kembali ---- */}
        <div className="mt-10 border-t border-gray-100 pt-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
