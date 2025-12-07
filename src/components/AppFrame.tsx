// src/components/AppFrame.tsx
"use client";

import type { ReactNode } from "react";

/**
 * TEMP: Minimal frame for demo stability.
 * We skip sidebar/top nav and just render the page content.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {children}
    </main>
  );
}
