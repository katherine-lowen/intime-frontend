// src/components/dev-auth-gate.tsx
"use client";

import type React from "react";

/**
 * Dev-only user shape (kept in case it's referenced elsewhere).
 */
export type DevUser = {
  id: string;
  email: string;
  name?: string | null;
  orgId?: string;
  role?: string;
};

/**
 * TEMP: No-op auth wrapper for YC/demo.
 *
 * Many pages wrap their content in <AuthGate>...</AuthGate>.
 * For this preview build, we don't enforce any auth at all –
 * we simply render the children.
 *
 * This avoids crashes / redirects while keeping the page code unchanged.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
