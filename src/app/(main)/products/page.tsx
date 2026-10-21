/**
 * @file app/(main)/products/page.tsx
 * @description Halaman Katalog Produk — search, filter, sort, pagination.
 *
 * Arsitektur:
 *   - Server Component (SEO-friendly, data fetching di server)
 *   - Filter menggunakan URL search params (bisa bookmark/share)
 *   - Client Component `CatalogFilters` untuk interaksi UI filter
 *
 * URL search params yang didukung:
 *   ?search=kaos&category=Fashion&sortBy=price-asc&page=2
 */

import { Metadata } from "next";
import Link from "next/link";
import { getProducts, getCategories } from "@/actions/product.actions";
import { ProductGrid } from "@/components/product/product-grid";
import { SORT_OPTIONS } from "@/lib/constants";
import { CatalogFilters } from "./catalog-filters";
import type { ProductSortOption } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Katalog Produk | Toko Online",
  description:
    "Temukan berbagai produk berkualitas dengan harga terbaik. Filter dan cari produk sesuai kebutuhan Anda.",
};

// Paksa Vercel selalu fetch data terbaru dari DB, bukan cache saat build
export const dynamic = "force-dynamic";

// Tipe untuk search params di Next.js 16
interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const search = params.search || "";
  const category = params.category || "";
  const sortBy = (params.sortBy as ProductSortOption) || "newest";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  // Fetch data secara paralel
  const [productsResult, categories] = await Promise.all([
    getProducts({ page, search, category, sortBy }),
    getCategories(),
  ]);

  const { data: products, pagination } = productsResult;

  // Hitung active filters
  const activeFilterCount = [search, category].filter(Boolean).length +
    (sortBy !== "newest" ? 1 : 0);

  // Helper: build URL dengan params
  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      search,
      category,
      sortBy,
      page: String(page),
      ...overrides,
    };
    for (const [key, val] of Object.entries(merged)) {
      if (val && val !== "" && !(key === "sortBy" && val === "newest") && !(key === "page" && val === "1")) {
        p.set(key, val);
      }
    }
    const qs = p.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ============================================================
            HEADER
            ============================================================ */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Katalog Produk
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination.totalItems > 0
              ? `Menampilkan ${products.length} dari ${pagination.totalItems} produk`
              : "Tidak ada produk ditemukan"}
          </p>
        </div>

        {/* ============================================================
            FILTERS (Client Component)
            ============================================================ */}
        <CatalogFilters
          currentSearch={search}
          currentCategory={category}
          currentSortBy={sortBy}
          categories={categories}
          sortOptions={SORT_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          activeFilterCount={activeFilterCount}
        />

        {/* ============================================================
            ACTIVE FILTERS BADGES
            ============================================================ */}
        {activeFilterCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">
              Filter aktif:
            </span>

            {search && (
              <Link
                href={buildUrl({ search: undefined, page: "1" })}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Pencarian: &ldquo;{search}&rdquo;
                <span className="text-gray-400">✕</span>
              </Link>
            )}

            {category && (
              <Link
                href={buildUrl({ category: undefined, page: "1" })}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {category}
                <span className="text-gray-400">✕</span>
              </Link>
            )}

            {sortBy !== "newest" && (
              <Link
                href={buildUrl({ sortBy: undefined, page: "1" })}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || sortBy}
                <span className="text-gray-400">✕</span>
              </Link>
            )}

            <Link
              href="/products"
              className="text-xs font-medium text-red-500 transition-colors hover:text-red-700"
            >
              Hapus Semua
            </Link>
          </div>
        )}

        {/* ============================================================
            PRODUCT GRID
            ============================================================ */}
        <ProductGrid products={products} />

        {/* ============================================================
            PAGINATION
            ============================================================ */}
        {pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {/* Tombol Previous */}
            {page > 1 ? (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="inline-flex h-10 items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-400">
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </span>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Tampilkan: halaman pertama, terakhir, dan ±1 dari halaman saat ini
                  return (
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - page) <= 1
                  );
                })
                .map((p, index, arr) => {
                  // Tambahkan ellipsis jika ada gap
                  const prevPage = arr[index - 1];
                  const showEllipsis = prevPage !== undefined && p - prevPage > 1;

                  return (
                    <span key={p} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-sm text-gray-400">…</span>
                      )}
                      {p === page ? (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white">
                          {p}
                        </span>
                      ) : (
                        <Link
                          href={buildUrl({ page: String(p) })}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          {p}
                        </Link>
                      )}
                    </span>
                  );
                })}
            </div>

            {/* Tombol Next */}
            {page < pagination.totalPages ? (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="inline-flex h-10 items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-400">
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
