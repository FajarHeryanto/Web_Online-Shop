/**
 * @file app/(main)/products/catalog-filters.tsx
 * @description Client Component untuk filter pencarian, kategori, dan sorting.
 *
 * Menggunakan URL search params (bukan Zustand) agar:
 *   - Filter bisa di-bookmark/share via URL
 *   - Server Component (page.tsx) bisa membaca params saat render
 *   - SEO-friendly (search engines melihat halaman berbeda per filter)
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface CatalogFiltersProps {
  currentSearch: string;
  currentCategory: string;
  currentSortBy: string;
  categories: string[];
  sortOptions: Array<{ value: string; label: string }>;
  activeFilterCount: number;
}

export function CatalogFilters({
  currentSearch,
  currentCategory,
  currentSortBy,
  categories,
  sortOptions,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Helper: update URL search params
  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();

    // Preserve existing params
    const current = {
      search: currentSearch,
      category: currentCategory,
      sortBy: currentSortBy,
    };

    const merged = { ...current, ...updates, page: "1" }; // Reset page saat filter berubah

    for (const [key, val] of Object.entries(merged)) {
      if (
        val &&
        val !== "" &&
        !(key === "sortBy" && val === "newest") &&
        !(key === "page" && val === "1")
      ) {
        params.set(key, val);
      }
    }

    const qs = params.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput.trim() || undefined });
  }

  function clearSearch() {
    setSearchInput("");
    updateParams({ search: undefined });
  }

  return (
    <div
      className={`mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${
        isPending ? "pointer-events-none opacity-70" : ""
      }`}
    >
      {/* Baris 1: Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari produk berdasarkan nama..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-20 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Baris 2: Kategori + Sorting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Kategori */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="hidden h-4 w-4 text-gray-400 sm:block" />
          <button
            onClick={() => updateParams({ category: undefined })}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              !currentCategory
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                updateParams({
                  category: cat === currentCategory ? undefined : cat,
                })
              }
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                cat === currentCategory
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdown Sorting */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="sortBy"
            className="shrink-0 text-xs font-medium text-gray-500"
          >
            Urutkan:
          </label>
          <select
            id="sortBy"
            value={currentSortBy}
            onChange={(e) => updateParams({ sortBy: e.target.value })}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
