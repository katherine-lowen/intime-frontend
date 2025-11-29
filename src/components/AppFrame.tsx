// src/components/AppFrame.tsx
"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import TopNav from "@/components/top-nav";

export function AppFrame({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

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
