/**
 * @file components/layout/user-menu.tsx
 * @description Menu user di Navbar — otentikasi & profil.
 * Warna: putih pada Deep Navy navbar.
 *
 * Belum login → "Daftar | Log In" (teks putih)
 * Sudah login → Avatar + Nama + Dropdown
 */

"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, Package, ChevronDown, Shield } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Loading skeleton
  if (status === "loading") {
    return <div className="h-8 w-24 animate-pulse rounded-lg bg-white/10" />;
  }

  // ---- Belum Login ----
  if (!session) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <Link
          href="/register"
          className="hidden rounded-lg px-2 py-1.5 font-medium text-white transition-colors hover:text-[#FF6B00] sm:inline-block sm:px-3"
        >
          Daftar
        </Link>
        <span className="hidden text-white/30 sm:inline">|</span>
        <Link
          href="/login"
          className="rounded-lg px-2 py-1.5 font-medium text-white transition-colors hover:text-[#FF6B00] sm:px-3"
        >
          Log In
        </Link>
      </div>
    );
  }

  // ---- Sudah Login ----
  const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-white/10 sm:gap-2 sm:px-2.5"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-800 text-white">
          <User className="h-3.5 w-3.5" />
        </div>
        <span className="hidden max-w-[100px] truncate font-medium text-white sm:inline sm:max-w-[140px]">
          {session.user?.name || "User"}
        </span>
        <ChevronDown
          className={`hidden h-3.5 w-3.5 text-white/50 transition-transform sm:block ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            {/* User Info */}
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">
                {session.user?.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {session.user?.email}
              </p>
            </div>

            {/* Menu */}
            <div className="py-1.5">
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Package className="h-4 w-4 text-gray-400" />
                Pesanan Saya
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Shield className="h-4 w-4 text-gray-400" />
                  Dashboard Admin
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 py-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
