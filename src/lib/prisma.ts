/**
 * @file lib/prisma.ts
 * @description Prisma Client Singleton untuk Next.js
 *
 * Masalah:
 *   Next.js melakukan hot-reload saat development. Setiap kali modul di-reload,
 *   `new PrismaClient()` dipanggil lagi → membuat koneksi database baru.
 *   Ini menyebabkan error "Too many database connections" dalam hitungan menit.
 *
 * Solusi:
 *   Simpan instance PrismaClient di `globalThis` (object global Node.js yang
 *   TIDAK ter-reset saat hot-reload). Di production, cukup buat instance biasa
 *   karena tidak ada hot-reload.
 *
 * Penggunaan:
 *   import { prisma } from "@/lib/prisma";
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from "@prisma/client";

/**
 * Deklarasi global agar TypeScript tidak complain saat kita
 * menambahkan property `prisma` ke `globalThis`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma Client.
 *
 * - Development: diambil dari cache `globalThis`, atau dibuat baru jika belum ada.
 * - Production: selalu instance baru (karena module di-cache secara natural oleh Node.js).
 *
 * Opsi `log` diatur agar query logging hanya aktif di development
 * untuk memudahkan debugging tanpa membanjiri log production.
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

/**
 * Simpan ke globalThis HANYA di development.
 * Di production, biarkan garbage collector mengelola lifecycle-nya.
 */
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
