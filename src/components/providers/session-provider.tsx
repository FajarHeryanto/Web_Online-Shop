/**
 * @file components/providers/session-provider.tsx
 * @description Wrapper Client Component untuk NextAuth SessionProvider.
 *
 * Diperlukan karena SessionProvider menggunakan React Context (client-only),
 * sementara root layout.tsx adalah Server Component.
 *
 * Optimasi Vercel Hobby Plan:
 *   - refetchOnWindowFocus={false}  → Tidak hit /api/auth/session setiap kali tab difokuskan
 *   - refetchInterval={0}           → Tidak polling session secara periodik
 *   Kedua opsi ini mencegah ribuan request tak perlu dari user yang sering pindah tab.
 */

"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}
