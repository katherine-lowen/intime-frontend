// src/components/admin-shell.tsx
import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href?: string;
  soon?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/" }],
  },
  {
    label: "People",
    items: [
      { label: "Directory", href: "/people" },
      { label: "Performance", href: "/performance", soon: true },
      { label: "Time off", href: "/timeoff", soon: true },
      { label: "Org chart", href: "/org-chart", soon: true },
    ],
  },
  {
    label: "Hiring",
    items: [
      { label: "Jobs", href: "/jobs" },
      { label: "Candidates", href: "/candidates" },
      { label: "Interview plans", href: "/interviews", soon: true },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Analytics", href: "/analytics", soon: true },
      { label: "Payroll", href: "/payroll", soon: true },
      { label: "Settings", href: "/settings", soon: true },
    ],
  },
];

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar – always visible now */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white/90 px-4 py-4">
        {/* Logo / product name */}
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-sm font-semibold text-white shadow-sm">
            in
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Intime</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </Link>

        <nav className="flex-1 space-y-4 text-sm">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-2">
              <div className="px-2 text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">
                {section.label}
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const baseClasses =
                    "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-slate-100";

                  if (!item.href) {
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          className={`${baseClasses} cursor-not-allowed text-slate-400`}
                          aria-disabled
                        >
                          <span>{item.label}</span>
                          {item.soon && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-slate-500">
                              Coming soon
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  }

                  const isSoon = item.soon;

                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={`${baseClasses} ${
                          isSoon ? "text-slate-400" : "text-slate-700"
                        }`}
                      >
                        <span>{item.label}</span>
                        {isSoon && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-slate-500">
                            Coming soon
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Help / footer area */}
        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-[0.7rem] text-slate-500">
          <div className="font-medium text-slate-600">Need help?</div>
          <div>Contact support or your Intime admin.</div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/70 px-4 backdrop-blur">
          <div className="flex flex-1 items-center gap-3">
            <div className="hidden text-sm font-medium text-slate-600 sm:block">
              Admin dashboard
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500 sm:flex">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Demo workspace</span>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white"
            >
              KS
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
