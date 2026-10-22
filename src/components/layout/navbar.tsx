/**
 * @file components/layout/navbar.tsx
 * @description Navbar utama toko dengan session awareness.
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
    <header className="sticky top-0 z-50 w-full border-b border-blue-900/10 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ---- Logo & Brand ---- */}
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src="/logo-lapakku.jpg"
            alt="Logo Lapakku"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* ---- Center: Navigation Links (Desktop) ---- */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-900"
          >
            Beranda
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-900"
          >
            Katalog
          </Link>
          <Link
            href="/orders"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-900"
          >
            Pesanan Saya
          </Link>
        </div>

        {/* ---- Right: Cart + Auth ---- */}
        <div className="flex items-center gap-2">
          <CartIndicator />
          <div className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
