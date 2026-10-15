/**
 * @file components/product/product-grid.tsx
 * @description Grid responsif untuk menampilkan daftar ProductCard.
 *
 * Server Component (menerima data produk dari parent).
 * Rendering grid: 1 kolom (mobile) → 2 (sm) → 3 (lg) → 4 (xl)
 */

import { ProductCard } from "./product-card";
import { PackageSearch } from "lucide-react";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageSearch className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900">
          Tidak ada produk ditemukan
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Coba ubah kata kunci pencarian atau filter Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
