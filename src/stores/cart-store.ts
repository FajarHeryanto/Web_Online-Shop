/**
 * @file stores/cart-store.ts
 * @description Zustand store untuk keranjang belanja dengan persistensi localStorage.
 *
 * Fitur:
 *   - Tambah item (auto-increment jika sudah ada)
 *   - Kurangi item (auto-remove jika quantity = 0)
 *   - Hapus item
 *   - Update quantity langsung
 *   - Hitung total item & total harga
 *   - Persist ke localStorage (survive page refresh)
 *   - Hydration-safe untuk Next.js SSR/SSG
 *
 * Penggunaan di komponen:
 *   "use client";
 *   import { useCartStore } from "@/stores/cart-store";
 *
 *   const { items, addItem, removeItem } = useCartStore();
 *   // atau selektif agar tidak re-render berlebihan:
 *   const totalPrice = useCartStore((s) => s.getTotalPrice());
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";
import { MAX_CART_ITEM_QUANTITY } from "@/lib/constants";

// ============================================================
// STATE INTERFACE
// ============================================================

interface CartState {
  /** Daftar item di keranjang */
  items: CartItem[];

  /**
   * Tambah item ke keranjang.
   * - Jika produk sudah ada → increment quantity (max = stok tersedia).
   * - Jika produk belum ada → tambahkan sebagai item baru.
   */
  addItem: (item: CartItem) => void;

  /**
   * Kurangi quantity item sebanyak 1.
   * - Jika quantity menjadi 0 → item otomatis dihapus.
   */
  decrementItem: (productId: string) => void;

  /**
   * Hapus item sepenuhnya dari keranjang.
   */
  removeItem: (productId: string) => void;

  /**
   * Set quantity item secara langsung.
   * - quantity ≤ 0 → item dihapus.
   * - quantity > stok → di-cap ke stok tersedia.
   * - quantity > MAX_CART_ITEM_QUANTITY → di-cap ke batas maksimum.
   */
  updateQuantity: (productId: string, quantity: number) => void;

  /**
   * Kosongkan seluruh keranjang (setelah checkout sukses).
   */
  clearCart: () => void;

  /**
   * Hitung total jumlah semua item di keranjang.
   */
  getTotalItems: () => number;

  /**
   * Hitung total harga seluruh item di keranjang.
   */
  getTotalPrice: () => number;
}

// ============================================================
// STORE IMPLEMENTATION
// ============================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // ---- Tambah Item ----
      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId
          );

          // Produk sudah ada di keranjang → increment
          if (existingIndex !== -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const newQty = existing.quantity + newItem.quantity;

            updatedItems[existingIndex] = {
              ...existing,
              // Clamp: tidak boleh melebihi stok atau batas maksimum
              quantity: Math.min(
                newQty,
                existing.stock,
                MAX_CART_ITEM_QUANTITY
              ),
              // Update harga & stok dari data terbaru
              price: newItem.price,
              stock: newItem.stock,
            };

            return { items: updatedItems };
          }

          // Produk baru → tambahkan ke array
          return {
            items: [
              ...state.items,
              {
                ...newItem,
                quantity: Math.min(
                  newItem.quantity,
                  newItem.stock,
                  MAX_CART_ITEM_QUANTITY
                ),
              },
            ],
          };
        });
      },

      // ---- Kurangi 1 Item ----
      decrementItem: (productId: string) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === productId
          );

          if (existingIndex === -1) return state; // Item tidak ditemukan

          const existing = state.items[existingIndex];
          const newQty = existing.quantity - 1;

          // Quantity jadi 0 → hapus dari keranjang
          if (newQty <= 0) {
            return {
              items: state.items.filter(
                (item) => item.productId !== productId
              ),
            };
          }

          // Quantity masih > 0 → update
          const updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...existing,
            quantity: newQty,
          };

          return { items: updatedItems };
        });
      },

      // ---- Hapus Item ----
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.productId !== productId
          ),
        }));
      },

      // ---- Update Quantity Langsung ----
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          // Quantity ≤ 0 → hapus item
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) => item.productId !== productId
              ),
            };
          }

          return {
            items: state.items.map((item) => {
              if (item.productId !== productId) return item;

              return {
                ...item,
                quantity: Math.min(
                  quantity,
                  item.stock,
                  MAX_CART_ITEM_QUANTITY
                ),
              };
            }),
          };
        });
      },

      // ---- Kosongkan Keranjang ----
      clearCart: () => {
        set({ items: [] });
      },

      // ---- Computed: Total Items ----
      getTotalItems: (): number => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // ---- Computed: Total Harga ----
      getTotalPrice: (): number => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "toko-online-cart", // Key di localStorage
      storage: createJSONStorage(() => localStorage),

      /**
       * Hanya persist field `items`.
       * Fungsi (addItem, removeItem, dll) tidak perlu disimpan
       * karena otomatis tersedia dari store definition.
       */
      partialize: (state) => ({ items: state.items }),
    }
  )
);
