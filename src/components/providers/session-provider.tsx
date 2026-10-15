/**
 * @file components/providers/session-provider.tsx
 * @description Wrapper Client Component untuk NextAuth SessionProvider.
 *
 * Diperlukan karena SessionProvider menggunakan React Context (client-only),
 * sementara root layout.tsx adalah Server Component.
 */

"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
