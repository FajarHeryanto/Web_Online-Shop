import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Matikan Image Optimization untuk menghemat kuota Vercel.
    // Semua gambar sudah menggunakan <img> standar, ini hanya safety net
    // jika ada komponen yang masih menggunakan next/image.
    unoptimized: true,
  },
};

export default nextConfig;
