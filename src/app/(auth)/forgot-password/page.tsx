/**
 * @file app/(auth)/forgot-password/page.tsx
 * @description Halaman Reset Password LAPAKKU — alur 2 langkah tanpa email.
 *
 * Langkah 1: Pengguna memasukkan email → diverifikasi ke database.
 * Langkah 2: Jika email terdaftar, pengguna bisa langsung memasukkan password baru.
 * Langkah 3: Tampil pesan sukses + tombol kembali ke login.
 *
 * Tidak membutuhkan SMTP atau layanan email eksternal (cocok untuk demo).
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { checkEmailExists, resetPassword } from "@/actions/auth.actions";

// ---------------------------------------------------------------------------
// Tipe step alur halaman
// ---------------------------------------------------------------------------
type Step = "email" | "newPassword" | "success";

// ---------------------------------------------------------------------------
// Helper: indikator kekuatan password
// ---------------------------------------------------------------------------
function getPasswordStrength(password: string): {
  score: number; // 0–4
  label: string;
  color: string;
} {
  if (password.length === 0) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 1, label: "Lemah", color: "bg-red-500" },
    { score: 2, label: "Cukup", color: "bg-yellow-500" },
    { score: 3, label: "Kuat", color: "bg-blue-500" },
    { score: 4, label: "Sangat Kuat", color: "bg-green-500" },
  ];
  const level = levels[score - 1] ?? levels[0];
  return { score, label: level.label, color: level.color };
}

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------
export default function ForgotPasswordPage() {
  // State alur
  const [step, setStep] = useState<Step>("email");
  const [userName, setUserName] = useState("");

  // State form
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // State UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const strength = getPasswordStrength(newPassword);

  // -----------------------------------------------------------------------
  // Handler: verifikasi email (Langkah 1)
  // -----------------------------------------------------------------------
  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await checkEmailExists(email.trim());
      if (res.success && res.data) {
        setUserName(res.data.name);
        setStep("newPassword");
      } else {
        setErrorMsg(res.error ?? "Email tidak ditemukan.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  // -----------------------------------------------------------------------
  // Handler: reset password (Langkah 2)
  // -----------------------------------------------------------------------
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword({ email: email.trim(), newPassword });
      if (res.success) {
        setStep("success");
      } else {
        setErrorMsg(res.error ?? "Gagal mereset password.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="flex min-h-screen">
      {/* ================================================================
          Panel Kiri — Branding (hanya tampil di md ke atas)
      ================================================================ */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-between bg-gradient-to-br from-[#0B2545] via-[#0d2d57] to-[#0B2545] p-10 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-xl h-10 w-10 flex items-center justify-center shadow-sm flex-shrink-0">
            <img
              src="/icon-lapakku.jpeg"
              alt="LAPAKKU"
              className="h-full w-full rounded-lg object-cover"
            />
          </div>
          <span className="font-extrabold text-xl tracking-wide text-white">
            LAPAKKU
          </span>
        </div>

        {/* Ilustrasi tengah */}
        <div className="flex flex-col items-center text-center gap-6">
          <div className="rounded-full bg-white/10 p-6 ring-1 ring-white/20">
            <KeyRound className="h-16 w-16 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-snug">
              Lupa Password?
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-xs mx-auto">
              Jangan khawatir. Masukkan email terdaftar kamu dan atur password
              baru langsung di halaman ini.
            </p>
          </div>

          {/* Langkah-langkah */}
          <div className="flex flex-col gap-3 w-full max-w-xs text-left">
            {[
              { num: "1", label: "Verifikasi email kamu" },
              { num: "2", label: "Masukkan password baru" },
              { num: "3", label: "Kembali login seperti biasa" },
            ].map((item) => (
              <div key={item.num} className="flex items-center gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold">
                  {item.num}
                </span>
                <span className="text-sm text-white/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer kiri */}
        <p className="text-xs text-white/30 text-center">
          &copy; {new Date().getFullYear()} LAPAKKU. All rights reserved.
        </p>
      </div>

      {/* ================================================================
          Panel Kanan — Form
      ================================================================ */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-10">
        {/* Tombol kembali */}
        <div className="w-full max-w-md mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* ============================================================
              STEP 1: Verifikasi Email
          ============================================================ */}
          {step === "email" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  Reset Password
                </h1>
                <p className="mt-1.5 text-sm text-gray-500">
                  Masukkan alamat email yang terdaftar di akun LAPAKKU kamu.
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="flex flex-col gap-5">
                {/* Error */}
                {errorMsg && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Email input */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@email.com"
                      required
                      autoComplete="email"
                      autoFocus
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    "Verifikasi Email"
                  )}
                </button>
              </form>
            </>
          )}

          {/* ============================================================
              STEP 2: Input Password Baru
          ============================================================ */}
          {step === "newPassword" && (
            <>
              <div className="mb-8">
                {/* Badge email terverifikasi */}
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Email terverifikasi
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Halo, {userName}!
                </h1>
                <p className="mt-1.5 text-sm text-gray-500">
                  Masukkan password baru untuk akun{" "}
                  <span className="font-medium text-gray-700">{email}</span>.
                </p>
              </div>

              <form
                onSubmit={handleResetPassword}
                className="flex flex-col gap-5"
              >
                {/* Error */}
                {errorMsg && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Password baru */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      autoFocus
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Indikator kekuatan password */}
                  {newPassword.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strength.score
                                ? strength.color
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Kekuatan:{" "}
                        <span
                          className={`font-medium ${
                            strength.score <= 1
                              ? "text-red-600"
                              : strength.score === 2
                              ? "text-yellow-600"
                              : strength.score === 3
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        >
                          {strength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Konfirmasi password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      required
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={
                        showConfirm
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {/* Pesan cocok / tidak */}
                  {confirmPassword.length > 0 && (
                    <p
                      className={`mt-1.5 text-xs ${
                        newPassword === confirmPassword
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {newPassword === confirmPassword
                        ? "Password cocok"
                        : "Password belum cocok"}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {/* Kembali ke step 1 */}
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setErrorMsg("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Ganti email
                </button>
              </form>
            </>
          )}

          {/* ============================================================
              STEP 3: Sukses
          ============================================================ */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="rounded-full bg-green-50 p-5 ring-1 ring-green-200">
                <CheckCircle2 className="h-14 w-14 text-green-500" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Password Berhasil Direset!
                </h1>
                <p className="mt-2 text-sm text-gray-500 max-w-sm">
                  Password akun{" "}
                  <span className="font-medium text-gray-700">{email}</span>{" "}
                  telah diperbarui. Silakan login dengan password barumu.
                </p>
              </div>

              <Link
                href={`/login?email=${encodeURIComponent(email)}`}
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98]"
              >
                Masuk Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
