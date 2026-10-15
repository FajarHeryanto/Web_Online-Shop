/**
 * @file app/(main)/layout.tsx
 * @description Layout utama toko — menampilkan Navbar dan Footer.
 *
 * Semua halaman publik (beranda, katalog, checkout, orders)
 * menggunakan layout ini sehingga memiliki navigasi konsisten.
 */

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
