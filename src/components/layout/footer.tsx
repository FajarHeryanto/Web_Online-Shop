/**
 * @file components/layout/footer.tsx
 * @description Footer sederhana untuk seluruh halaman.
 */

import { Store } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900">
              <Store className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              TokoOnline
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            &copy; {currentYear} TokoOnline. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
