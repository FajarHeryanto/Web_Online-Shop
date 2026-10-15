/**
 * @file lib/utils.ts
 * @description Fungsi utilitas yang dipakai di seluruh aplikasi.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gabungkan class Tailwind secara aman. Menangani:
 * - Conditional classes (via clsx)
 * - Konflik class Tailwind (via twMerge)
 *
 * @example
 *   cn("px-4 py-2", isActive && "bg-blue-500", "px-6")
 *   // → "py-2 px-6 bg-blue-500" (px-4 di-merge menjadi px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format angka menjadi format Rupiah.
 *
 * @example
 *   formatRupiah(150000) // → "Rp150.000"
 *   formatRupiah(1500000) // → "Rp1.500.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate slug dari string (untuk URL produk).
 *
 * @example
 *   slugify("Kaos Polos Hitam XL") // → "kaos-polos-hitam-xl"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // hapus karakter non-alphanumeric
    .replace(/[\s_]+/g, "-")     // spasi/underscore → dash
    .replace(/-+/g, "-")         // collapse multiple dash
    .replace(/^-+|-+$/g, "");    // trim dash di awal/akhir
}

/**
 * Truncate teks dengan ellipsis.
 *
 * @example
 *   truncate("Deskripsi produk yang sangat panjang sekali", 20)
 *   // → "Deskripsi produk ya…"
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Generate order number unik dengan format: ORD-YYYYMMDD-XXXXX
 *
 * @example
 *   generateOrderNumber() // → "ORD-20261006-A3F8K"
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

/**
 * Delay/sleep untuk async operations (berguna untuk debounce, retry).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Periksa apakah kita berada di environment server (bukan browser).
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}
