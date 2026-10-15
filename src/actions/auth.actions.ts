/**
 * @file actions/auth.actions.ts
 * @description Server Actions untuk registrasi pengguna baru.
 *
 * Flow registrasi:
 *   1. Validasi input (nama, email, password min 6 char)
 *   2. Cek email belum terdaftar
 *   3. Hash password dengan bcrypt (12 rounds)
 *   4. Simpan user ke database
 *   5. Return success → client auto-login via signIn()
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
      return { success: false, error: "Email sudah terdaftar. Silakan login." };
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
