// src/components/AppFrame.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import TopNav from "@/components/top-nav";

const FRAMELESS_PREFIXES = ["/login", "/signup", "/choose-plan"];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";

  const isFrameless = FRAMELESS_PREFIXES.some((prefix) =>
    pathname === prefix ||
    pathname.startsWith(`${prefix}/`) ||
    pathname.startsWith(`${prefix}?`)
  );

  if (isFrameless) {
    // No sidebar / top-nav for these routes
    return <>{children}</>;
  }

  return (
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
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
