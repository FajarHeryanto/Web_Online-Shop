/**
 * @file components/layout/navbar.tsx
 * @description Navbar utama toko — Deep Navy theme dengan menu tengah presisi.
 *
 * Arsitektur:
 *   <Navbar>           → Server Component (logo, link statis)
 *     <CartIndicator>   → Client Component (badge keranjang)
 *     <UserMenu>        → Client Component (login/profil dropdown)
 */

import Link from "next/link";
import { CartIndicator } from "./cart-indicator";
import { UserMenu } from "./user-menu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B2545]">
      <nav className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 sm:px-6 lg:px-8">
        {/* ---- Kiri: Logo & Brand ---- */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <img
              src="/icon-lapakku.jpg"
              alt="Logo LAPAKKU"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="text-xl font-extrabold tracking-wide text-white">
              LAPAKKU
            </span>
          </Link>
        </div>

        {/* ---- Tengah: Navigation Links ---- */}
        <div className="flex items-center justify-center gap-4 md:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-200 transition-colors hover:text-[#FF6B00]"
          >
            Beranda
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-slate-200 transition-colors hover:text-[#FF6B00]"
          >
            Katalog
          </Link>
          <Link
            href="/orders"
            className="hidden text-sm font-medium text-slate-200 transition-colors hover:text-[#FF6B00] sm:inline"
          >
            Pesanan Saya
          </Link>
        </div>

        {/* ---- Kanan: Cart + Auth ---- */}
        <div className="flex items-center justify-end gap-2">
          <CartIndicator />
          <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
