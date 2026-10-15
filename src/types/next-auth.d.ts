/**
 * @file next-auth.d.ts
 * @description Deklarasi augmentasi modul NextAuth untuk menambahkan properti kustom (id dan role) pada tipe Session dan JWT.
 */

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
