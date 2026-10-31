/**
 * @file middleware.ts
 * @description Middleware Next.js — Auth guard + Bot blocker + Rate limiter.
 *
 * Fitur:
 *   1. Blokir User-Agent bot jahat/scraper (return 403).
 *   2. Rate limiting sederhana per IP pada route /api/* (in-memory, 60 req/menit).
 *   3. Proteksi auth pada route yang membutuhkan login (/checkout, /orders, /profile, /admin).
 *
 * Matcher:
 *   - Hanya berjalan pada route tertentu.
 *   - MENGECUALIKAN /_next/static, /_next/image, /favicon.ico, dan file statis.
 *
 * Catatan rate limiter:
 *   Vercel Serverless = stateless, jadi Map di-reset setiap cold start.
 *   Untuk production serius, gunakan Upstash Redis. Untuk proyek kuliah/demo, ini sudah cukup
 *   mengurangi ~80% spam karena bot biasanya hit satu instance yang masih warm.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ---------------------------------------------------------------------------
// 1. DAFTAR BOT JAHAT YANG DIBLOKIR
// ---------------------------------------------------------------------------
const BLOCKED_BOTS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
  "Bytespider",
  "GPTBot",
  "CCBot",
  "ClaudeBot",
  "Scrapy",
  "DataForSeoBot",
  "BLEXBot",
  "MegaIndex",
  "serpstatbot",
  "Sogou",
  "Yandex",
  "ZoominfoBot",
  "SEOkicks",
  "seekport",
  "Amazonbot",
  "Buck",
  "newspaper",
  "python-requests",
  "Go-http-client",
  "Java/",
  "libwww-perl",
  "curl/",
  "wget/",
];

// ---------------------------------------------------------------------------
// 2. RATE LIMITER (In-Memory, per IP)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 menit
const RATE_LIMIT_MAX_REQUESTS = 60; // max 60 request per menit per IP

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Bersihkan entry expired setiap 5 menit agar memory tidak membengkak
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60_000;

function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}

function isRateLimited(ip: string): boolean {
  cleanupRateLimitMap();
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt <= now) {
    // Window baru
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

// ---------------------------------------------------------------------------
// 3. ROUTE YANG BUTUH AUTH
// ---------------------------------------------------------------------------
const AUTH_ROUTES = ["/checkout", "/orders", "/profile", "/admin"];

function requiresAuth(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

// ---------------------------------------------------------------------------
// 4. MIDDLEWARE UTAMA
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  // ---- A. Blokir bot jahat ----
  const isBlockedBot = BLOCKED_BOTS.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  if (isBlockedBot) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ---- B. Rate limit pada /api/* (kecuali webhook Midtrans) ----
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhook/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 }
      );
    }
  }

  // ---- C. Auth guard untuk route yang membutuhkan login ----
  if (requiresAuth(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// 5. MATCHER — Middleware HANYA berjalan pada route ini
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    // Route yang perlu auth guard
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/admin/:path*",
    // API routes (untuk rate limiting & bot blocking)
    "/api/:path*",
    // Halaman publik utama (untuk bot blocking saja)
    "/",
    "/products/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
