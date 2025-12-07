// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";

import { IdentitySync } from "@/components/IdentitySync";
import { AppFrame } from "@/components/AppFrame";

// Vercel Analytics + Speed Insights
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Intime HR Platform",
  description: "Intime HRIS · People, hiring, and time-aware insights.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {/* Sync Supabase → localStorage client-side */}
        <IdentitySync />

        {/* App shell (sidebar/topnav logic) */}
        <AppFrame>{children}</AppFrame>

        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
