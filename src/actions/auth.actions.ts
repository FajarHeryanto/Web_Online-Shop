/**
 * @file actions/auth.actions.ts
 * @description Server Actions untuk autentikasi: registrasi dan reset password.
 *
 * Flow registrasi:
 *   1. Validasi input (nama, email, password min 6 char)
 *   2. Cek email belum terdaftar
 *   3. Hash password dengan bcrypt (12 rounds)
 *   4. Simpan user ke database
 *   5. Return success → client auto-login via signIn()
 *
 * Flow reset password (tanpa email/token — cocok untuk demo):
 *   1. checkEmailExists(email) → verifikasi email terdaftar, return nama user
 *   2. resetPassword({ email, newPassword }) → hash & update password di DB
 */

"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/**
 * Daftarkan user baru. Password di-hash dengan bcrypt (12 rounds).
 *
 * @example
 *   const result = await registerUser({
 *     name: "Budi",
 *     email: "budi@email.com",
 *     password: "rahasia123",
 *   });
 */
export async function registerUser(
  input: RegisterInput
): Promise<ApiResponse<{ id: string; email: string }>> {
  try {
    // Validasi input
    if (!input.name.trim() || !input.email.trim() || !input.password) {
      return { success: false, error: "Semua field harus diisi." };
    }

    if (input.password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email.trim())) {
      return { success: false, error: "Format email tidak valid." };
    }

    // Cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar, silakan gunakan email lain atau langsung login." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        password: hashedPassword,
        role: "USER",
      },
    });

    return {
      success: true,
      data: { id: user.id, email: user.email },
    };
  } catch (error) {
    console.error("[registerUser] Error:", error);
    return { success: false, error: "Terjadi kesalahan. Coba lagi nanti." };
  }
}

// ---------------------------------------------------------------------------
// Reset Password (2-step, tanpa pengiriman email — untuk demo)
// ---------------------------------------------------------------------------

interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

/**
 * Langkah 1: Verifikasi apakah email terdaftar di database.
 * Jika terdaftar, kembalikan nama pengguna untuk sapaan personal di UI.
 *
 * @example
 *   const res = await checkEmailExists("budi@email.com");
 *   // { success: true, data: { name: "Budi" } }
 */
export async function checkEmailExists(
  email: string
): Promise<ApiResponse<{ name: string }>> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail) {
      return { success: false, error: "Email tidak boleh kosong." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return { success: false, error: "Format email tidak valid." };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { name: true },
    });

    if (!user) {
      return { success: false, error: "Email tidak terdaftar di sistem kami." };
    }

    return { success: true, data: { name: user.name } };
  } catch (error) {
    console.error("[checkEmailExists] Error:", error);
    return { success: false, error: "Terjadi kesalahan. Coba lagi nanti." };
  }
}

/**
 * Langkah 2: Reset password pengguna.
 * Hanya bisa dipanggil setelah email diverifikasi via checkEmailExists().
 * Password baru di-hash dengan bcrypt (12 rounds) sebelum disimpan.
 *
 * Validasi server-side:
 *   - Email harus terdaftar
 *   - Password baru minimal 6 karakter
 *
 * @example
 *   const res = await resetPassword({ email: "budi@email.com", newPassword: "baru123" });
 *   // { success: true, data: null }
 */
export async function resetPassword(
  input: ResetPasswordInput
): Promise<ApiResponse<null>> {
  try {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Validasi input dasar
    if (!normalizedEmail || !input.newPassword) {
      return { success: false, error: "Email dan password baru harus diisi." };
    }

    if (input.newPassword.length < 6) {
      return { success: false, error: "Password baru minimal 6 karakter." };
    }

    // Pastikan email masih terdaftar (validasi server-side)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "Email tidak terdaftar di sistem kami." };
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(input.newPassword, 12);

    // Update password di database
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    return { success: true, data: null };
  } catch (error) {
    console.error("[resetPassword] Error:", error);
    return { success: false, error: "Terjadi kesalahan. Coba lagi nanti." };
  }
}
