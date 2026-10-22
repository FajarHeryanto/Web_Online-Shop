/**
 * @file app/(auth)/login/page.tsx
 * @description Halaman login — desain split-screen premium.
 *
 * Layout:
 *   Desktop: Kiri = branding panel (gradient gelap), Kanan = form login
 *   Mobile:  Full-width form dengan branding minimal di atas
 *
 * Fitur:
 *   - Show/hide password toggle
 *   - callbackUrl redirect setelah login
 *   - Demo credentials badge
 *   - Tombol "Kembali ke Beranda"
 *   - Loading spinner
 */

"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ShieldCheck,
  Truck,
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";

// ============================================================
// LOGIN FORM (wrapped in Suspense karena useSearchParams)
// ============================================================

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sanitize callbackUrl: middleware NextAuth sering mengirim URL absolut
  // (mis. "http://localhost:3000/checkout") yang membuat router.push gagal.
  // Kita extract path-nya saja agar selalu relatif.
  const rawCallback = searchParams.get("callbackUrl") || "/";
  const callbackUrl = (() => {
    try {
      const url = new URL(rawCallback, window.location.origin);
      return url.pathname + url.search;
    } catch {
      return rawCallback.startsWith("/") ? rawCallback : "/";
    }
  })();

  // Deteksi apakah user baru saja selesai mendaftar (redirect dari register page)
  const isJustRegistered = searchParams.get("registered") === "true";
  const prefillEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRegisteredBanner, setShowRegisteredBanner] = useState(isJustRegistered);

  // Pre-fill email dari parameter URL saat pertama kali render
  useEffect(() => {
    if (prefillEmail) {
      setEmail(decodeURIComponent(prefillEmail));
    }
  }, [prefillEmail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email dan password harus diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Email atau password salah. Periksa kembali kredensial Anda.");
        setIsLoading(false);
      } else if (result?.ok) {
        // Login berhasil — redirect ke callbackUrl
        // Gunakan router.push + refresh, fallback ke window.location
        router.push(callbackUrl);
        router.refresh();

        // Safety net: jika router.push tidak bekerja dalam 2 detik, paksa redirect
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 2000);
        // JANGAN setIsLoading(false) — biarkan spinner aktif sampai redirect selesai
      } else {
        setError("Login gagal. Silakan coba lagi.");
        setIsLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan server. Coba lagi.");
      setIsLoading(false);
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
            <img
              src="/logo-lapakku.jpg"
              alt="Logo Lapakku"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center — Quote */}
        <div className="max-w-md">
          <blockquote className="text-3xl font-semibold leading-snug text-white">
            &ldquo;Belanja mudah, pembayaran aman, pengiriman cepat ke seluruh
            Indonesia.&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div>
              <p className="text-sm font-medium text-white">Tim LAPAKKU</p>
              <p className="text-xs text-gray-400">E-Commerce Terpercaya</p>
            </div>
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
          RIGHT PANEL — Form Login
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

          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <img
              src="/logo-lapakku.jpg"
              alt="Logo Lapakku"
              className="h-8 w-auto object-contain"
            />
          </Link>

          <Link
            href="/register"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Buat Akun
          </Link>
        </div>

        {/* Form Area */}
        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Selamat Datang Kembali
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Masuk ke akun Anda untuk melanjutkan belanja.
              </p>
            </div>

            {/* Banner sukses registrasi */}
            {showRegisteredBanner && (
              <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-medium">Akun berhasil dibuat!</p>
                  <p className="mt-0.5 text-emerald-600">
                    Silakan masukkan password Anda untuk masuk.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegisteredBanner(false)}
                  className="ml-auto shrink-0 rounded-md p-0.5 text-emerald-400 transition-colors hover:text-emerald-600"
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    tabIndex={-1}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
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
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-gray-900 transition-colors hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>

            {/* ---- Demo Credentials ---- */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Akun Demo
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    role: "Admin",
                    email: "admin@lapakku.com",
                    pass: "admin123",
                    color: "bg-amber-100 text-amber-700",
                  },
                  {
                    role: "Customer",
                    email: "budi@email.com",
                    pass: "budi123",
                    color: "bg-blue-100 text-blue-700",
                  },
                ].map((acc) => (
                  <div
                    key={acc.role}
                    className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 shadow-sm"
                  >
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${acc.color}`}
                    >
                      {acc.role}
                    </span>
                    <div className="min-w-0 flex-1 text-xs text-gray-600">
                      <span className="truncate">{acc.email}</span>
                      <span className="mx-1.5 text-gray-300">/</span>
                      <span className="font-mono">{acc.pass}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(acc.pass);
                        copyToClipboard(acc.email, acc.role);
                      }}
                      className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      title="Isi otomatis"
                    >
                      {copiedField === acc.role ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE EXPORT (with Suspense boundary)
// ============================================================

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
