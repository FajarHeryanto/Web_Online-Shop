/**
 * @file app/(main)/products/[slug]/add-to-cart-section.tsx
 * @description Client Component — kontrol kuantitas dan tombol "Tambah ke Keranjang"
 *              di halaman detail produk.
 *
 * Terpisah dari page.tsx agar page tetap Server Component (SEO/perf).
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";

interface AddToCartSectionProps {
  product: Product;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;

  function handleAdd() {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      stock: product.stock,
      slug: product.slug,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  function handleBuyNow() {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      stock: product.stock,
      slug: product.slug,
    });

    router.push("/checkout");
  }

  return (
    <div className="space-y-4">
      {/* Kontrol Kuantitas */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Jumlah:</span>
        <div className="flex items-center rounded-lg border border-gray-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="inline-flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
            aria-label="Kurangi jumlah"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                setQuantity(Math.min(Math.max(1, val), product.stock));
              }
            }}
            className="h-10 w-14 border-x border-gray-300 text-center text-sm font-semibold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.min(product.stock, q + 1))
            }
            disabled={quantity >= product.stock}
            className="inline-flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
            aria-label="Tambah jumlah"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {product.stock > 0 && (
          <span className="text-xs text-gray-400">
            Maks. {product.stock}
          </span>
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
            isAdded
              ? "bg-green-600 text-white"
              : "border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-50"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4" />
              Ditambahkan!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Tambah ke Keranjang
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
