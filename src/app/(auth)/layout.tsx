/**
 * @file app/(auth)/layout.tsx
 * @description Layout khusus untuk halaman autentikasi (login, register).
 *
 * TIDAK menampilkan Navbar dan Footer utama toko.
 * Halaman auth memiliki desain sendiri yang berdiri penuh (full-page).
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
