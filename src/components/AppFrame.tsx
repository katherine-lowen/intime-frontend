// src/components/AppFrame.tsx
"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import api from "@/lib/api";

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

// Shape of the user returned by your backend
type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
};

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = isBareRoute(pathname);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Fetch current user once (for non-bare routes)
  useEffect(() => {
  if (bare) return;

  async function loadUser() {
    try {
      const user = await api.get<CurrentUser>("/auth/me");
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to load current user", err);
    }
  }

  loadUser();
}, [bare]);


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
    <div className="flex min-h-screen">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        currentUser={currentUser}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <TopNav
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={!sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
