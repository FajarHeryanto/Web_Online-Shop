/**
 * @file middleware.ts
 * @description Middleware Next.js untuk proteksi route tertentu.
 *
 * Strategi:
 *   - Route PUBLIK: /, /products, /products/[slug], /login, /register
 *   - Route TERPROTEKSI: /checkout, /orders, /profile, /admin
 *
 * Jika pengunjung yang belum login mengakses route terproteksi,
 * mereka otomatis di-redirect ke /login?callbackUrl=[halaman-asal].
 * Setelah login berhasil, NextAuth akan redirect kembali ke callbackUrl.
 */

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
