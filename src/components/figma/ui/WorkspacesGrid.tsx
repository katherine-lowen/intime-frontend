// src/components/figma/ui/WorkspacesGrid.tsx
"use client";

import Link from "next/link";

type Workspace = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
};

const WORKSPACES: Workspace[] = [
  {
    id: "people",
    title: "People",
    description: "Manage employees, teams, and org structure.",
    href: "/people",
    icon: "👥",
  },
  {
    id: "hiring",
    title: "Hiring",
    description: "Track roles, pipeline, and candidate flow.",
    href: "/jobs",
    icon: "📋",
  },
  {
    id: "timeoff",
    title: "Time off",
    description: "Approve requests and view team calendars.",
    href: "/timeoff",
    icon: "🏖️",
  },
  {
    id: "operations",
    title: "Operations",
    description: "Payroll, policies, and HRIS operations overview.",
    href: "/operations",
    icon: "🧩",
  },
  // add more if you have routes for them:
  // {
  //   id: "performance",
  //   title: "Performance",
  //   description: "Reviews, goals, and feedback cycles.",
  //   href: "/performance",
  //   icon: "📈",
  // },
];

export function WorkspacesGrid() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Workspaces</h2>
        {/* optional link to a full nav page */}
        {/* <Link href="/workspaces" className="text-xs font-medium text-slate-500 hover:text-slate-700">
          View all
        </Link> */}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {WORKSPACES.map((ws) => (
          <Link
            key={ws.id}
            href={ws.href}
            className="group glass-card rounded-2xl px-4 py-3.5 shadow-sm ring-1 ring-slate-100/80 transition
                       hover:-translate-y-[1px] hover:shadow-md hover:ring-sky-100/80"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-lg">
                <span className="translate-y-[1px]">{ws.icon}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-slate-900">
                  {ws.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                  {ws.description}
                </p>
                <span className="mt-2 inline-flex items-center text-[10px] font-medium text-sky-600 group-hover:text-sky-700">
                  Open workspace <span className="ml-1 text-[9px]">↗</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
