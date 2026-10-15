/**
 * @file lib/constants.ts
 * @description Konstanta aplikasi yang digunakan di seluruh codebase.
 */

/** Nama aplikasi. */
export const APP_NAME = "Toko Online" as const;

/** Jumlah produk per halaman (pagination). */
export const PRODUCTS_PER_PAGE = 12 as const;

/** Jumlah pesanan per halaman (pagination). */
export const ORDERS_PER_PAGE = 10 as const;

/** Batas stok rendah untuk alert di admin dashboard. */
export const LOW_STOCK_THRESHOLD = 5 as const;

/** Maksimum jumlah item per produk dalam keranjang. */
export const MAX_CART_ITEM_QUANTITY = 99 as const;

/** Daftar kategori produk yang tersedia. */
export const PRODUCT_CATEGORIES = [
  "Elektronik",
  "Fashion",
  "Makanan & Minuman",
  "Kesehatan",
  "Olahraga",
  "Rumah Tangga",
  "Buku & Alat Tulis",
  "Lainnya",
] as const;

/** Tipe dari kategori produk (derived dari const array). */
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Map status pesanan ke label bahasa Indonesia. */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Terbayar",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
} as const;

/** Map status pesanan ke warna badge. */
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
} as const;

/** Opsi sorting produk dengan label. */
export const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga: Rendah ke Tinggi" },
  { value: "price-desc", label: "Harga: Tinggi ke Rendah" },
  { value: "name-asc", label: "Nama: A-Z" },
] as const;
