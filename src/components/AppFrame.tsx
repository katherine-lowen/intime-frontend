// src/components/AppFrame.tsx
"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, Users, Briefcase, Calendar, Target, Settings } from "lucide-react";
import { OrgSwitcher } from "@/components/org-switcher";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import { DevStatusBanner } from "@/components/DevStatusBanner";

type NavItem = { label: string; href: string; icon?: React.ComponentType<any> };
type NavSection = { label: string; items: NavItem[] };

const NAV_CONFIG: Record<
  "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE",
  NavSection[]
> = {
  OWNER: [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", href: "/org/dashboard", icon: Home },
      ],
    },
    {
      label: "People",
      items: [
        { label: "Directory", href: "/org/people", icon: Users },
        { label: "Time off", href: "/org/time-off", icon: Calendar },
      ],
    },
    {
      label: "Talent",
      items: [
        { label: "Jobs", href: "/org/jobs", icon: Briefcase },
        { label: "Performance", href: "/org/performance", icon: Target },
      ],
    },
    {
      label: "Settings",
      items: [{ label: "Org settings", href: "/org/settings", icon: Settings }],
    },
  ],
  ADMIN: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/org/dashboard", icon: Home }],
    },
    {
      label: "People",
      items: [
        { label: "Directory", href: "/org/people", icon: Users },
        { label: "Time off", href: "/org/time-off", icon: Calendar },
      ],
    },
    {
      label: "Talent",
      items: [
        { label: "Jobs", href: "/org/jobs", icon: Briefcase },
        { label: "Performance", href: "/org/performance", icon: Target },
      ],
    },
    {
      label: "Settings",
      items: [{ label: "Org settings", href: "/org/settings", icon: Settings }],
    },
  ],
  MANAGER: [
    {
      label: "My team",
      items: [
        { label: "Team dashboard", href: "/org/my-team", icon: Home },
        { label: "Approvals", href: "/org/time-off/manage", icon: Calendar },
        { label: "Performance", href: "/org/performance", icon: Target },
      ],
    },
    {
      label: "Talent",
      items: [{ label: "Jobs", href: "/org/jobs", icon: Briefcase }],
    },
  ],
  EMPLOYEE: [
    {
      label: "Me",
      items: [
        { label: "Home", href: "/org/me", icon: Home },
        { label: "My profile", href: "/org/me", icon: Users },
        { label: "My time off", href: "/org/time-off", icon: Calendar },
        { label: "My reviews", href: "/org/performance", icon: Target },
      ],
    },
  ],
};

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { activeOrg, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const role = activeOrg?.role as keyof typeof NAV_CONFIG | undefined;
  const navSections = role ? NAV_CONFIG[role] : [];
  const baseOrgPath = activeOrg?.orgSlug ? `/org/${activeOrg.orgSlug}` : "/org";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading workspace…
      </div>
    );
  }

  if (!activeOrg || !role) {
    return <Unauthorized />;
  }

  const resolveHref = (href: string) => {
    if (href.startsWith("/org")) {
      return href.replace("/org", baseOrgPath);
    }
    return href;
  };

  const isActive = (href: string) => {
    const resolved = resolveHref(href);
    return pathname === resolved || (pathname || "").startsWith(`${resolved}/`);
  };

  const renderNav = () => (
    <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-slate-200 bg-white">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold text-slate-900">Intime</div>
        <button
          className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          onClick={() => setSidebarCollapsed((v) => !v)}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <div className="px-4">
        <OrgSwitcher />
      </div>
      <nav className="mt-4 space-y-4 px-2 pb-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-2">
            <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const target = resolveHref(item.href);
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={target}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {!sidebarCollapsed && renderNav()}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {activeOrg.orgName}
              </div>
              <div className="text-xs text-slate-500">{role.toLowerCase()}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OrgSwitcher />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {(activeOrg.orgName || "Org").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="border-b border-slate-200 bg-white px-6 py-2">
          <DevStatusBanner />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
