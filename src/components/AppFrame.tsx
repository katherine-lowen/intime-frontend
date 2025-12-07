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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Bare layout (login, signup, etc.)
  if (bare) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </main>
    );
  }

  const handleToggleSidebar = () =>
    setSidebarCollapsed((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sticky/pinned sidebar with its own scroll area */}
      <div className="sticky top-0 h-screen shrink-0 overflow-y-auto">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          // Dev-only: no backend user yet; sidebar should handle null.
          currentUser={null}
        />
      </div>

      {/* Main column: top nav + scrollable page content */}
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <TopNav
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={!sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
