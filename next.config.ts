import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Cloudinary CDN
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Placeholder gambar saat development
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com", // Fallback placeholder
      },
    ],
  },
};

export default nextConfig;
