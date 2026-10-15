/**
 * @file components/layout/cart-indicator.tsx
 * @description Ikon keranjang belanja dengan badge counter reaktif.
 *
 * Ini adalah Client Component karena:
 *   - Mengakses Zustand store (client-side state)
 *   - Badge counter harus update realtime saat item ditambah/dihapus
 *   - Menggunakan hydration-safe hook agar tidak terjadi mismatch
 */

"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartTotalItems } from "@/hooks/use-cart";

export function CartIndicator() {
  const totalItems = useCartTotalItems();

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      aria-label={`Keranjang belanja, ${totalItems} item`}
    >
      <ShoppingCart className="h-5 w-5" />

      {/* Badge counter — hanya tampil jika ada item */}
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-bold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
