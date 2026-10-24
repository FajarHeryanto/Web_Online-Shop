/**
 * @file components/layout/cart-indicator.tsx
 * @description Ikon keranjang belanja dengan badge counter reaktif.
 * Warna: putih pada Deep Navy navbar, badge oranye.
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
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:text-[#FF6B00]"
      aria-label={`Keranjang belanja, ${totalItems} item`}
    >
      <ShoppingCart className="h-5 w-5" />

      {/* Badge counter — hanya tampil jika ada item */}
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-bold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
