// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import TopNav from "@/components/top-nav";

export const metadata = {
  title: "Intime HR Platform",
  description: "Intime HRIS · People, hiring, and time-aware insights.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="flex min-h-screen">
          {/* Left nav */}
          <aside className="hidden w-64 md:flex flex-col bg-slate-950">
  <Sidebar />
</aside>

          {/* Main column */}
          <div className="flex min-h-screen flex-1 flex-col">
            {/* Top breadcrumb/nav */}
            <TopNav />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
