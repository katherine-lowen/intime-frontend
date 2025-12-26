"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { OrgSidebar } from "@/components/org/OrgSidebar";
import { Search } from "lucide-react";
import { useCommandPalette } from "@/components/command/useCommandPalette";
import { GlobalSearchCommand } from "@/components/search/GlobalSearchCommand";
import { OrgSwitcher } from "@/components/org/OrgSwitcher";

export default function OrgLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params?.orgSlug;
  const command = useCommandPalette();

  // Show a real loading state instead of a blank screen
  if (!orgSlug) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-sm">Loading workspace…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex min-h-screen">
        <OrgSidebar orgSlug={orgSlug} />

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
              {/* Left: Search */}
              <button
                type="button"
                onClick={() => command.setOpen(true)}
                className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-left transition hover:border-slate-700 hover:bg-slate-900"
              >
                <Search className="h-4 w-4 text-slate-400" />
                <span className="flex-1 text-sm text-slate-400">Search or jump to...</span>
                <kbd className="hidden rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400 sm:inline">
                  ⌘K
                </kbd>
              </button>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <OrgSwitcher />
              </div>
            </div>
          </header>

          {/* Page container */}
          <main className="mx-auto w-full max-w-6xl px-4 py-6">
            {children}
          </main>
        </div>
      </div>
      <GlobalSearchCommand orgSlug={orgSlug} open={command.open} setOpen={command.setOpen} />
    </div>
  );
}
