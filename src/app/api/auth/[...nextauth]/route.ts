/**
 * @file route.ts
 * @description Rute catch-all API NextAuth.js untuk menangani semua alur autentikasi (GET dan POST).
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
