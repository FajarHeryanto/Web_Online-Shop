/**
 * @file components/layout/navbar.tsx
 * @description Navbar utama toko — Deep Navy theme, mobile-first responsive.
 *
 * Layout:
 *   Mobile:  Baris 1 = Logo + Cart + Auth, Baris 2 = Menu links (centered)
 *   Desktop: Grid 3-kolom = Logo | Menu (center) | Cart + Auth
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
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---- Baris Utama: Logo | (desktop: menu) | Cart + Auth ---- */}
        <div className="flex h-14 items-center justify-between md:grid md:h-16 md:grid-cols-3">
          {/* Kiri: Logo & Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <img
                src="/icon-lapakku.jpg"
                alt="Logo LAPAKKU"
                className="h-8 w-8 rounded-lg object-cover md:h-9 md:w-9"
              />
              <span className="text-lg font-extrabold tracking-wide text-white md:text-xl">
                LAPAKKU
              </span>
            </Link>
          </div>

          {/* Tengah: Navigation Links — hanya tampil di Desktop */}
          <div className="hidden items-center justify-center gap-6 md:flex">
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
              className="text-sm font-medium text-slate-200 transition-colors hover:text-[#FF6B00]"
            >
              Pesanan Saya
            </Link>
          </div>

          {/* Kanan: Cart + Auth */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <CartIndicator />
            <div className="mx-0.5 hidden h-6 w-px bg-white/20 sm:block" />
            <UserMenu />
          </div>
        </div>

        {/* ---- Baris Kedua (Mobile): Menu Links ---- */}
        <div className="flex items-center justify-center gap-6 border-t border-white/10 py-2 md:hidden">
          <Link
            href="/"
            className="text-xs font-medium text-slate-300 transition-colors hover:text-[#FF6B00] sm:text-sm"
          >
            Beranda
          </Link>
          <Link
            href="/products"
            className="text-xs font-medium text-slate-300 transition-colors hover:text-[#FF6B00] sm:text-sm"
          >
            Katalog
          </Link>
          <Link
            href="/orders"
            className="text-xs font-medium text-slate-300 transition-colors hover:text-[#FF6B00] sm:text-sm"
          >
            Pesanan Saya
          </Link>
        </div>
      </nav>
    </header>
  );
}
