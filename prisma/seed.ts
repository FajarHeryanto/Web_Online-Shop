/**
 * @file prisma/seed.ts
 * @description Seed script untuk mengisi database dengan data dummy.
 *
 * Jalankan dengan:
 *   npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database...\n");

  // ---- Hapus data lama (reset) ----
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️  Data lama dihapus.");

  // ---- Buat User Admin & Customer (password di-hash) ----
  const adminPassword = await bcrypt.hash("admin123", 12);
  const customerPassword = await bcrypt.hash("budi123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Toko",
      email: "admin@lapakku.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`👤 Admin dibuat: ${admin.email} (password: admin123)`);

  const customer = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi@email.com",
      password: customerPassword,
      role: "USER",
    },
  });
  console.log(`👤 Customer dibuat: ${customer.email} (password: budi123)`);

  // ---- Buat 8 Produk Dummy ----
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Kaos Polos Hitam Premium",
        slug: "kaos-polos-hitam-premium",
        description:
          "Kaos polos berbahan cotton combed 30s yang nyaman dipakai sehari-hari. Tersedia dalam berbagai ukuran dari S hingga XXL. Bahan adem dan tidak mudah luntur.",
        price: 89000,
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        category: "Fashion",
      },
    }),
    prisma.product.create({
      data: {
        name: "Sepatu Sneakers Casual",
        slug: "sepatu-sneakers-casual",
        description:
          "Sepatu sneakers casual dengan desain modern dan sol yang empuk. Cocok untuk aktivitas sehari-hari maupun hangout bersama teman.",
        price: 349000,
        stock: 25,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
        category: "Fashion",
      },
    }),
    prisma.product.create({
      data: {
        name: "Topi Baseball Denim",
        slug: "topi-baseball-denim",
        description:
          "Topi baseball dengan bahan denim berkualitas tinggi. Desain klasik yang cocok untuk gaya casual Anda.",
        price: 75000,
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=500&h=500&fit=crop",
        category: "Fashion",
      },
    }),
    prisma.product.create({
      data: {
        name: 'Headphone Wireless Bluetooth',
        slug: "headphone-wireless-bluetooth",
        description:
          "Headphone wireless dengan teknologi Bluetooth 5.3 dan fitur Active Noise Cancelling. Baterai tahan hingga 30 jam pemakaian.",
        price: 459000,
        stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        category: "Elektronik",
      },
    }),
    prisma.product.create({
      data: {
        name: "Tas Ransel Anti Air",
        slug: "tas-ransel-anti-air",
        description:
          "Tas ransel dengan bahan waterproof dan kompartemen laptop 15.6 inch. Dilengkapi port USB charging dan desain ergonomis.",
        price: 199000,
        stock: 30,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
        category: "Fashion",
      },
    }),
    prisma.product.create({
      data: {
        name: "Tumbler Stainless Steel 750ml",
        slug: "tumbler-stainless-steel-750ml",
        description:
          "Tumbler vacuum insulated yang menjaga suhu minuman panas hingga 12 jam dan dingin hingga 24 jam. BPA-free dan food grade.",
        price: 125000,
        stock: 60,
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
        category: "Rumah Tangga",
      },
    }),
    prisma.product.create({
      data: {
        name: "Mouse Wireless Ergonomis",
        slug: "mouse-wireless-ergonomis",
        description:
          "Mouse wireless dengan desain ergonomis dan DPI adjustable hingga 4000. Sensor optik presisi tinggi, baterai tahan 18 bulan.",
        price: 159000,
        stock: 3, // Stok menipis - untuk testing badge "Sisa X item"
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
        category: "Elektronik",
      },
    }),
    prisma.product.create({
      data: {
        name: "Buku Catatan Premium A5",
        slug: "buku-catatan-premium-a5",
        description:
          "Buku catatan hardcover dengan kertas 100gsm dan 200 halaman. Desain minimalis, cocok untuk journaling dan catatan kerja.",
        price: 45000,
        stock: 0, // Stok habis - untuk testing overlay "Stok Habis"
        imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&h=500&fit=crop",
        category: "Buku & Alat Tulis",
      },
    }),
  ]);

  console.log(`\n📦 ${products.length} produk berhasil dibuat:`);
  products.forEach((p) => {
    const stockLabel =
      p.stock === 0
        ? "❌ HABIS"
        : p.stock <= 5
          ? `⚠️  ${p.stock} item`
          : `✅ ${p.stock} item`;
    console.log(`   - ${p.name} (Rp${p.price.toLocaleString("id-ID")}) [${stockLabel}]`);
  });

  console.log("\n✅ Seeding selesai!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding gagal:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
