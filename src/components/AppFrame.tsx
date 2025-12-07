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

  const handleToggleCollapse = () =>
    setSidebarCollapsed((prev) => !prev);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        // No backend user for now; sidebar should handle null/undefined
        currentUser={null}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <TopNav
          onToggleSidebar={handleToggleCollapse}
          isSidebarOpen={!sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
