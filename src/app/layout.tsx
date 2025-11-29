// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { IdentitySync } from "@/components/IdentitySync";
import { AppFrame } from "@/components/AppFrame";

export const metadata = {
  title: "Intime HR Platform",
  description: "Intime HRIS · People, hiring, and time-aware insights.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {/* Runs client-side only; syncs Supabase user → localStorage */}
        <IdentitySync />

        {/* Client-side app shell that decides about sidebar/top-nav */}
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
