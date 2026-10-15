/**
 * @file stores/filter-store.ts
 * @description Zustand store untuk state filter & pencarian produk.
 *
 * Store ini TIDAK di-persist ke localStorage karena:
 * - Filter bersifat sementara (reset saat user navigasi ulang)
 * - URL search params lebih tepat untuk bookmark/share (akan ditangani di UI)
 *
 * Penggunaan:
 *   "use client";
 *   import { useFilterStore } from "@/stores/filter-store";
 *
 *   const { search, setSearch, category, setCategory } = useFilterStore();
 */

import { create } from "zustand";
import type { FilterStore, ProductSortOption } from "@/types";

// ---- Default Values ----

const DEFAULT_FILTERS: Omit<
  FilterStore,
  "setSearch" | "setCategory" | "setPriceRange" | "setSortBy" | "resetFilters"
> = {
  search: "",
  category: "",
  minPrice: null,
  maxPrice: null,
  sortBy: "newest",
};

// ---- Store ----

export const useFilterStore = create<FilterStore>()((set) => ({
  ...DEFAULT_FILTERS,

  setSearch: (search: string) => {
    set({ search });
  },

  setCategory: (category: string) => {
    set({ category });
  },

  setPriceRange: (minPrice: number | null, maxPrice: number | null) => {
    set({ minPrice, maxPrice });
  },

  setSortBy: (sortBy: ProductSortOption) => {
    set({ sortBy });
  },

  resetFilters: () => {
    set({ ...DEFAULT_FILTERS });
  },
}));
