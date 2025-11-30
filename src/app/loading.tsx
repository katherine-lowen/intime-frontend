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
        {/* Sync Supabase user -> localStorage */}
        <IdentitySync />
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
