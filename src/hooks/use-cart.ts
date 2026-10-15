/**
 * @file hooks/use-cart.ts
 * @description Hook wrapper aman-hidrasi untuk Zustand cart store.
 *
 * Masalah:
 *   Zustand `persist` middleware membaca localStorage saat hidrasi di browser.
 *   Namun di server (SSR), localStorage tidak ada → state awal = items: [].
 *   Jika client langsung render items dari localStorage, terjadi
 *   "hydration mismatch" (server HTML ≠ client HTML).
 *
 * Solusi:
 *   Render nilai default (0 item) di server DAN di client saat mount pertama.
 *   Setelah `useEffect` berjalan (client-only), baru ambil state asli dari store.
 *   Ini menjamin server HTML === client first-render HTML.
 */

"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

/**
 * Hook untuk mengambil total item keranjang (hydration-safe).
 * Digunakan di Navbar untuk badge counter.
 *
 * @returns Total jumlah item di keranjang (0 saat SSR / first render)
 */
export function useCartTotalItems(): number {
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    // Subscribe ke perubahan store setelah hidrasi
    const unsubscribe = useCartStore.subscribe((state) => {
      setTotalItems(
        state.items.reduce((sum, item) => sum + item.quantity, 0)
      );
    });

    // Set nilai awal dari store yang sudah terhidrasi
    const currentItems = useCartStore.getState().items;
    setTotalItems(
      currentItems.reduce((sum, item) => sum + item.quantity, 0)
    );

    return unsubscribe;
  }, []);

  return totalItems;
}

/**
 * Hook untuk mengambil total harga keranjang (hydration-safe).
 * Digunakan di CartSummary dan Checkout.
 *
 * @returns Total harga seluruh item (0 saat SSR / first render)
 */
export function useCartTotalPrice(): number {
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const unsubscribe = useCartStore.subscribe((state) => {
      setTotalPrice(
        state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      );
    });

    const currentItems = useCartStore.getState().items;
    setTotalPrice(
      currentItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    );

    return unsubscribe;
  }, []);

  return totalPrice;
}
