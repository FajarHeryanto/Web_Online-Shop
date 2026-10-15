/**
 * @file actions/product.actions.ts
 * @description Server Actions untuk operasi produk.
 *
 * Mengapa Server Actions (bukan Route Handler)?
 *   1. Dipanggil langsung dari Server Component → zero client JS bundle.
 *   2. Dapat juga dipanggil dari Client Component via form action / manual call.
 *   3. Type-safe end-to-end (input → output tanpa serialisasi manual).
 *   4. Otomatis di-cache & revalidate oleh Next.js.
 *
 * Konvensi:
 *   - Semua fungsi di file ini adalah async server functions.
 *   - Error handling konsisten: return { success, data?, error? }.
 *   - Prisma query dibatasi select/include yang diperlukan saja.
 */

"use server";

import { prisma } from "@/lib/prisma";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type {
  Product,
  ApiResponse,
  PaginatedResponse,
  ProductSortOption,
} from "@/types";
import type { Prisma } from "@prisma/client";

// ============================================================
// TYPES KHUSUS UNTUK ACTIONS INI
// ============================================================

/** Parameter untuk query daftar produk (dari filter UI). */
interface GetProductsParams {
  /** Halaman saat ini (1-indexed) */
  page?: number;
  /** Jumlah item per halaman */
  limit?: number;
  /** Kata kunci pencarian (nama atau deskripsi) */
  search?: string;
  /** Filter kategori */
  category?: string;
  /** Harga minimum */
  minPrice?: number;
  /** Harga maksimum */
  maxPrice?: number;
  /** Urutan sorting */
  sortBy?: ProductSortOption;
}

// ============================================================
// 1. GET PRODUCTS (LIST + FILTER + PAGINATION)
// ============================================================

/**
 * Ambil daftar produk dengan filter, pencarian, dan paginasi.
 *
 * @example
 *   // Di Server Component:
 *   const result = await getProducts({ page: 1, category: "Elektronik" });
 *
 *   // Di Client Component (via server action call):
 *   const result = await getProducts({ search: "kaos", sortBy: "price-asc" });
 */
export async function getProducts(
  params: GetProductsParams = {}
): Promise<PaginatedResponse<Product>> {
  const {
    page = 1,
    limit = PRODUCTS_PER_PAGE,
    search,
    category,
    minPrice,
    maxPrice,
    sortBy = "newest",
  } = params;

  // ---- Build WHERE clause secara dinamis ----
  const where: Prisma.ProductWhereInput = {};

  // Pencarian: cari di nama DAN deskripsi
  // SQLite LIKE sudah case-insensitive untuk ASCII secara default
  if (search && search.trim() !== "") {
    where.OR = [
      { name: { contains: search.trim() } },
      { description: { contains: search.trim() } },
    ];
  }

  // Filter kategori
  if (category && category.trim() !== "") {
    where.category = category.trim();
  }

  // Filter rentang harga
  if (minPrice !== undefined && minPrice !== null) {
    where.price = { ...((where.price as Prisma.FloatFilter) ?? {}), gte: minPrice };
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    where.price = { ...((where.price as Prisma.FloatFilter) ?? {}), lte: maxPrice };
  }

  // ---- Build ORDER BY ----
  const orderBy = buildOrderBy(sortBy);

  // ---- Execute queries (parallel: data + count) ----
  const skip = (page - 1) * limit;

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}

// ============================================================
// 2. GET PRODUCT BY SLUG (DETAIL)
// ============================================================

/**
 * Ambil detail satu produk berdasarkan slug.
 * Slug digunakan karena lebih SEO-friendly dan human-readable.
 *
 * @example
 *   const result = await getProductBySlug("kaos-polos-hitam");
 *   if (result.success) {
 *     console.log(result.data?.name); // "Kaos Polos Hitam"
 *   }
 */
export async function getProductBySlug(
  slug: string
): Promise<ApiResponse<Product>> {
  try {
    if (!slug || slug.trim() === "") {
      return { success: false, error: "Slug produk harus diisi." };
    }

    const product = await prisma.product.findUnique({
      where: { slug: slug.trim() },
    });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan." };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("[getProductBySlug] Error:", error);
    return { success: false, error: "Gagal mengambil data produk." };
  }
}

// ============================================================
// 3. GET PRODUCT BY ID
// ============================================================

/**
 * Ambil detail satu produk berdasarkan ID.
 * Digunakan untuk keperluan internal (admin, cart validation, dll).
 *
 * @example
 *   const result = await getProductById("clxyz123...");
 */
export async function getProductById(
  id: string
): Promise<ApiResponse<Product>> {
  try {
    if (!id || id.trim() === "") {
      return { success: false, error: "ID produk harus diisi." };
    }

    const product = await prisma.product.findUnique({
      where: { id: id.trim() },
    });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan." };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("[getProductById] Error:", error);
    return { success: false, error: "Gagal mengambil data produk." };
  }
}

// ============================================================
// 4. GET CATEGORIES (DISTINCT)
// ============================================================

/**
 * Ambil daftar kategori unik yang ada di database.
 * Berguna untuk dropdown filter di halaman katalog.
 *
 * @example
 *   const categories = await getCategories();
 *   // → ["Elektronik", "Fashion", "Makanan & Minuman"]
 */
export async function getCategories(): Promise<string[]> {
  try {
    const results = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return results.map((r) => r.category);
  } catch (error) {
    console.error("[getCategories] Error:", error);
    return [];
  }
}

// ============================================================
// 5. VALIDATE CART ITEMS (SERVER-SIDE STOCK CHECK)
// ============================================================

/** Hasil validasi per item keranjang. */
interface CartValidationItem {
  productId: string;
  name: string;
  requestedQty: number;
  availableStock: number;
  currentPrice: number;
  isValid: boolean;
  message?: string;
}

/**
 * Validasi item keranjang terhadap data terbaru di database.
 * Dipanggil sebelum checkout untuk memastikan:
 *   - Produk masih ada
 *   - Stok masih cukup
 *   - Harga terbaru (mendeteksi perubahan harga)
 *
 * @example
 *   const validation = await validateCartItems([
 *     { productId: "abc", quantity: 2 },
 *     { productId: "def", quantity: 5 },
 *   ]);
 */
export async function validateCartItems(
  cartItems: Array<{ productId: string; quantity: number }>
): Promise<ApiResponse<CartValidationItem[]>> {
  try {
    if (!cartItems.length) {
      return { success: false, error: "Keranjang belanja kosong." };
    }

    const productIds = cartItems.map((item) => item.productId);

    // Ambil data produk terbaru dari DB
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, stock: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const validationResults: CartValidationItem[] = cartItems.map((cartItem) => {
      const product = productMap.get(cartItem.productId);

      // Produk tidak ditemukan (mungkin sudah dihapus)
      if (!product) {
        return {
          productId: cartItem.productId,
          name: "Produk tidak ditemukan",
          requestedQty: cartItem.quantity,
          availableStock: 0,
          currentPrice: 0,
          isValid: false,
          message: "Produk sudah tidak tersedia.",
        };
      }

      // Stok tidak cukup
      if (cartItem.quantity > product.stock) {
        return {
          productId: product.id,
          name: product.name,
          requestedQty: cartItem.quantity,
          availableStock: product.stock,
          currentPrice: product.price,
          isValid: false,
          message:
            product.stock === 0
              ? "Stok habis."
              : `Stok tersisa ${product.stock} item.`,
        };
      }

      // Valid
      return {
        productId: product.id,
        name: product.name,
        requestedQty: cartItem.quantity,
        availableStock: product.stock,
        currentPrice: product.price,
        isValid: true,
      };
    });

    const allValid = validationResults.every((r) => r.isValid);

    return {
      success: allValid,
      data: validationResults,
      error: allValid ? undefined : "Beberapa item tidak valid. Silakan periksa keranjang Anda.",
    };
  } catch (error) {
    console.error("[validateCartItems] Error:", error);
    return { success: false, error: "Gagal memvalidasi keranjang." };
  }
}

// ============================================================
// HELPERS (PRIVATE)
// ============================================================

/**
 * Build Prisma orderBy clause dari sort option string.
 */
function buildOrderBy(
  sortBy: ProductSortOption
): Prisma.ProductOrderByWithRelationInput {
  switch (sortBy) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "name-asc":
      return { name: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}
