/**
 * @file components/layout/footer.tsx
 * @description Footer — Deep Navy theme, matching Navbar.
 */

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0B2545]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <img
            src="/icon-lapakku.jpg"
            alt="Logo LAPAKKU"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="text-lg font-bold text-white">LAPAKKU</span>
        </Link>

        {/* Copyright */}
        <p className="text-sm text-slate-300">
          &copy; {currentYear} LAPAKKU. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
