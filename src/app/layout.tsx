import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LAPAKKU — Belanja Online Mudah & Terpercaya",
    template: "%s | LAPAKKU",
  },
  description:
    "Temukan berbagai produk berkualitas dengan harga terbaik. Belanja online mudah, aman, dan terpercaya.",
  icons: {
    icon: "/icon-lapakku.jpg",
    shortcut: "/icon-lapakku.jpg",
    apple: "/icon-lapakku.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-white font-sans text-gray-900">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
