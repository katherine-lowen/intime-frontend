// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";

import { IdentitySync } from "@/components/IdentitySync";
import { AuthProvider } from "@/context/auth";

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
        <AuthProvider>
          {/* Sync Supabase → localStorage client-side */}
          <IdentitySync />
          {children}
        </AuthProvider>

        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
