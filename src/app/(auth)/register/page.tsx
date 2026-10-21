/**
 * @file app/(auth)/register/page.tsx
 * @description Halaman registrasi — desain split-screen premium.
 *
 * Layout cocok dengan halaman login (branding panel kiri, form kanan).
 * Fitur: nama, email, password + konfirmasi, show/hide, password match indicator.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
  Check,
  X,
  ShieldCheck,
  Truck,
  CreditCard,
} from "lucide-react";
import { registerUser } from "@/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength checks
  const hasMinLength = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Semua field harus diisi.");
      return;
    }
    if (!hasMinLength) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (!passwordsMatch) {
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.success) {
        setError(result.error || "Registrasi gagal.");
        setIsLoading(false);
        return;
      }

      // Registrasi berhasil — arahkan ke halaman login dengan email pre-filled
      // agar user tinggal memasukkan password saja.
      const registeredEmail = encodeURIComponent(email.trim().toLowerCase());
      router.push(`/login?registered=true&email=${registeredEmail}`);
      // JANGAN setIsLoading(false) — biarkan spinner aktif sampai redirect selesai
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ==================================================================
          LEFT PANEL — Branding (Desktop Only)
          ================================================================== */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 lg:flex">
        {/* Top — Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TokoOnline</span>
          </Link>
        </div>

        {/* Center — Quote */}
        <div className="max-w-md">
          <blockquote className="text-3xl font-semibold leading-snug text-white">
            &ldquo;Bergabung sekarang dan nikmati kemudahan belanja online
            terpercaya.&rdquo;
          </blockquote>
          <div className="mt-8 space-y-4">
            {[
              "Gratis ongkir untuk pesanan pertama",
              "Ribuan produk berkualitas pilihan",
              "Pembayaran aman & mudah via Midtrans",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Features */}
        <div className="flex gap-6">
          {[
            { icon: ShieldCheck, label: "Pembayaran Aman" },
            { icon: Truck, label: "Gratis Ongkir" },
            { icon: CreditCard, label: "Bayar Mudah" },
          ].map((feat) => (
            <div key={feat.label} className="flex items-center gap-2">
              <feat.icon className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">{feat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================
          RIGHT PANEL — Form Register
          ================================================================== */}
      <div className="flex w-full flex-col bg-white lg:w-1/2">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Beranda
          </Link>

          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">TokoOnline</span>
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Sudah punya akun?
          </Link>
        </div>

        {/* Form Area */}
        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Buat Akun Baru
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Daftar gratis dan mulai belanja sekarang.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    required
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* Strength indicator */}
                {password && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    {hasMinLength ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400" />
                    )}
                    <span
                      className={
                        hasMinLength ? "text-emerald-600" : "text-gray-400"
                      }
                    >
                      Minimal 6 karakter
                    </span>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    {passwordsMatch ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-400" />
                    )}
                    <span
                      className={
                        passwordsMatch ? "text-emerald-600" : "text-red-500"
                      }
                    >
                      {passwordsMatch
                        ? "Password cocok"
                        : "Password tidak cocok"}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Membuat akun...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-gray-900 transition-colors hover:underline"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
