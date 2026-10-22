/**
 * @file components/layout/footer.tsx
 * @description Footer sederhana untuk seluruh halaman.
 */

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-blue-900/10 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <img
              src="/logo-lapakku.jpg"
              alt="Logo Lapakku"
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Copyright */}
          <p className="text-sm text-slate-500">
            &copy; {currentYear} LAPAKKU. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
