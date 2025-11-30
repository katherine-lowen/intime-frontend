// src/components/AppFrame.tsx
"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import TopNav from "@/components/top-nav";

/**
 * Routes that should NOT display sidebar + top nav
 */
const BARE_ROUTES = new Set<string>([
  "/choose-plan",
  "/login",
  "/signup",
  "/reset-password",
]);

function isBareRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return BARE_ROUTES.has(pathname);
}

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = isBareRoute(pathname);

  // -----------------------
  // BARE LAYOUT (no chrome)
  // -----------------------
  if (bare) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </main>
    );
  }

  // -----------------------
  // NORMAL APP LAYOUT
  // -----------------------
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar handles both desktop + mobile internally */}
      <Sidebar open={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        <TopNav
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
