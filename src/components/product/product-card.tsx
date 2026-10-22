/**
 * @file components/product/product-card.tsx
 * @description Kartu produk untuk ditampilkan di grid katalog.
 *
 * Fitur:
 *   - Gambar produk dengan aspect ratio konsisten + fallback onError
 *   - Nama produk (truncate jika terlalu panjang)
 *   - Harga dalam format Rupiah
 *   - Badge kategori
 *   - Indikator stok (habis / menipis)
 *   - Tombol "Tambah ke Keranjang" (interaktif via Zustand)
 *   - Link ke halaman detail (via slug)
 *   - Hover effect & animasi halus
 *
 * Client Component karena membutuhkan:
 *   - onClick handler (addItem ke Zustand store)
 *   - useState untuk feedback animasi tombol
 *   - onError handler untuk fallback gambar
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check, Package } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  function handleAddToCart(e: React.MouseEvent) {
    // Mencegah klik tombol memicu navigasi Link
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      stock: product.stock,
      slug: product.slug,
    });

    // Feedback visual: ikon berubah jadi centang selama 1.5 detik
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-blue-900/30 hover:shadow-lg"
    >
      {/* ---- Gambar Produk ---- */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50">
            <Package className="h-12 w-12 text-gray-300" />
            <span className="text-xs text-gray-400">Gambar tidak tersedia</span>
          </div>
        )}

        {/* Badge Kategori */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
          {product.category}
        </span>

        {/* Badge Stok */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-900">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* ---- Info Produk ---- */}
      <div className="flex flex-1 flex-col p-4">
        {/* Nama Produk */}
        <h3 className="line-clamp-2 text-sm font-medium text-blue-950 group-hover:text-blue-800">
          {product.name}
        </h3>

        {/* Stok Menipis */}
        {isLowStock && (
          <p className="mt-1 text-xs text-amber-600">
            Sisa {product.stock} item
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Harga & Tombol */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-lg font-bold text-blue-950">
            {formatRupiah(product.price)}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`
              inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
              transition-all duration-200
              ${
                isOutOfStock
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : isAdded
                    ? "bg-green-600 text-white"
                    : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
              }
            `}
            aria-label={
              isOutOfStock
                ? "Stok habis"
                : isAdded
                  ? "Ditambahkan ke keranjang"
                  : `Tambah ${product.name} ke keranjang`
            }
          >
            {isAdded ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
