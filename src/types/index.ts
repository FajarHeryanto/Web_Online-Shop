/**
 * @file types/index.ts
 * @description Deklarasi tipe data TypeScript untuk seluruh aplikasi.
 *
 * Strategi:
 *   1. Tipe model database → Re-export langsung dari `@prisma/client`.
 *      Ini menjamin tipe selalu sinkron dengan `schema.prisma`.
 *   2. Tipe turunan (computed/joined) → Menggunakan `Prisma` namespace
 *      dengan utility type `GetPayload` agar include/select-aware.
 *   3. Tipe UI / API → Didefinisikan manual untuk keperluan
 *      frontend, request body, dan response yang tidak 1:1 dengan DB.
 */

import type { Prisma } from "@prisma/client";

// ============================================================
// 1. RE-EXPORT MODEL & ENUM DARI PRISMA
//    Gunakan ini untuk parameter fungsi, return type, dll.
//    Selalu sinkron dengan schema.prisma setelah `prisma generate`.
// ============================================================

export type {
  User,
  Product,
  Order,
  OrderItem,
} from "@prisma/client";

/**
 * Role & OrderStatus didefinisikan manual sebagai string union
 * karena SQLite tidak mendukung native enum di Prisma.
 * Nilai harus sinkron dengan @default() di schema.prisma.
 */
export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// ============================================================
// 2. TIPE TURUNAN (DENGAN RELASI)
//    Menggunakan Prisma.XxxGetPayload untuk tipe yang sudah
//    meng-include relasi. Ini type-safe terhadap schema.
// ============================================================

/**
 * Product lengkap dengan semua OrderItem-nya.
 * Digunakan di halaman admin untuk melihat produk beserta histori order.
 */
export type ProductWithOrderItems = Prisma.ProductGetPayload<{
  include: { orderItems: true };
}>;

/**
 * Order lengkap dengan items dan detail produk di tiap item.
 * Digunakan di halaman detail pesanan & riwayat transaksi.
 */
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: { product: true };
    };
  };
}>;

/**
 * Order lengkap dengan items, produk, DAN data user.
 * Digunakan di halaman admin manajemen pesanan.
 */
export type OrderWithItemsAndUser = Prisma.OrderGetPayload<{
  include: {
    user: true;
    items: {
      include: { product: true };
    };
  };
}>;

/**
 * OrderItem yang sudah include detail produk.
 * Digunakan di komponen keranjang & ringkasan pesanan.
 */
export type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: { product: true };
}>;

/**
 * User tanpa field password (aman untuk dikirim ke client).
 * Menggunakan Prisma `omit` utility type.
 */
export type SafeUser = Omit<
  Prisma.UserGetPayload<Record<string, never>>,
  "password"
>;

// ============================================================
// 3. TIPE UI / FRONTEND (TIDAK TERIKAT LANGSUNG KE DB)
// ============================================================

// ---- Cart (Keranjang Belanja - Zustand Store) ----

/** Item dalam keranjang belanja (client-side state). */
export interface CartItem {
  /** ID produk dari database */
  productId: string;
  /** Nama produk (disimpan agar tidak perlu fetch ulang) */
  name: string;
  /** Harga satuan saat ditambahkan ke keranjang */
  price: number;
  /** Jumlah item */
  quantity: number;
  /** URL gambar produk */
  imageUrl: string | null;
  /** Stok tersedia (untuk validasi client-side) */
  stock: number;
  /** Slug produk (untuk link ke detail) */
  slug: string;
}

/** State & actions Zustand store keranjang belanja. */
export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// ---- Product Filters (Zustand Store) ----

/** Parameter filter & pencarian produk. */
export interface ProductFilterParams {
  /** Kata kunci pencarian */
  search: string;
  /** Filter kategori (string kosong = semua) */
  category: string;
  /** Harga minimum */
  minPrice: number | null;
  /** Harga maksimum */
  maxPrice: number | null;
  /** Urutan sorting */
  sortBy: ProductSortOption;
}

/** Opsi pengurutan produk. */
export type ProductSortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

/** State & actions Zustand store filter produk. */
export interface FilterStore extends ProductFilterParams {
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setSortBy: (sortBy: ProductSortOption) => void;
  resetFilters: () => void;
}

// ---- Checkout & Payment ----

/** Data form alamat pengiriman. */
export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

/** Data yang dikirim ke API untuk membuat pesanan. */
export interface CreateOrderInput {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  totalAmount: number;
}

/** Response dari API create payment (Midtrans). */
export interface MidtransSnapResponse {
  /** Token untuk membuka Snap popup */
  token: string;
  /** URL redirect (jika tidak pakai popup) */
  redirectUrl: string;
}

/** Payload webhook notification dari Midtrans. */
export interface MidtransNotification {
  transaction_status: "capture" | "settlement" | "pending" | "deny" | "cancel" | "expire" | "failure";
  order_id: string;
  gross_amount: string;
  payment_type: string;
  signature_key: string;
  fraud_status?: "accept" | "deny" | "challenge";
  status_code: string;
}

// ---- API Response Wrappers ----

/** Response API generik dengan paginasi. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/** Response API generik untuk single item atau action. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---- Admin Dashboard ----

/** Data statistik untuk dashboard admin. */
export interface DashboardStats {
  /** Total pendapatan (omzet) */
  totalRevenue: number;
  /** Jumlah pesanan baru (status PENDING) */
  newOrders: number;
  /** Jumlah total produk */
  totalProducts: number;
  /** Produk dengan stok ≤ 5 */
  lowStockProducts: number;
}
