// src/components/top-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ProfileMenu from "@/components/profile-menu";

/* --------------------------------------
   EXISTING LABEL META + CRUMB LOGIC
--------------------------------------- */

type LabelMeta = {
  title: string;
  section: string;
  subtitle?: string;
};

const BASE_LABELS: Record<string, LabelMeta> = {
  "/": { title: "Dashboard", section: "Overview", subtitle: "Org-wide snapshot" },
  "/dashboard": { title: "Dashboard", section: "Overview", subtitle: "Org-wide snapshot" },

  "/people": { title: "Directory", section: "People", subtitle: "Everyone in your org" },
  "/people/new": { title: "Add employee", section: "People", subtitle: "Create a new profile" },

  "/jobs": { title: "Jobs", section: "Hiring", subtitle: "Open roles & pipelines" },
  "/candidates": { title: "Candidates", section: "Hiring", subtitle: "Applicants & interviews" },
  "/hiring": { title: "Hiring home", section: "Hiring", subtitle: "Hiring overview & AI tools" },
  "/hiring/ai-studio": {
    title: "AI Studio",
    section: "Hiring",
    subtitle: "AI-native workflows for hiring",
  },

  "/operations": {
    title: "Operations",
    section: "Operations",
    subtitle: "Analytics & configuration",
  },
  "/settings": {
    title: "Settings",
    section: "Operations",
    subtitle: "Org & workspace settings",
  },

  "/timeoff": { title: "Time off", section: "People", subtitle: "Policies & requests" },
  "/help": { title: "Help & support", section: "Support" },
};

type Crumb = { label: string; href?: string };

function getMeta(pathname: string): LabelMeta {
  const basePath = pathname.split("?")[0];

  if (BASE_LABELS[basePath]) {
    return BASE_LABELS[basePath];
  }

  if (basePath.startsWith("/people/")) {
    return { title: "Person", section: "People", subtitle: "Employee profile" };
  }

  if (basePath.startsWith("/hiring/ai-studio/")) {
    return {
      title: "AI Studio tool",
      section: "Hiring",
      subtitle: "AI workflow detail",
    };
  }

  if (basePath.startsWith("/jobs/")) {
    return { title: "Job", section: "Hiring", subtitle: "Job detail" };
  }

  if (basePath.startsWith("/candidates/")) {
    return { title: "Candidate", section: "Hiring", subtitle: "Candidate detail" };
  }

  return { title: "Workspace", section: "Intime", subtitle: "HR platform" };
}

function getCrumbs(pathname: string): Crumb[] {
  const path = pathname.split("?")[0];
  const segments = path.split("/").filter(Boolean);

  // Root / dashboard
  if (segments.length === 0 || segments[0] === "dashboard") {
    return [{ label: "Overview", href: "/dashboard" }, { label: "Dashboard" }];
  }

  const [first, second, third] = segments;

  // People
  if (first === "people") {
    const crumbs: Crumb[] = [{ label: "People", href: "/people" }];
    if (!second) {
      crumbs.push({ label: "Directory" });
    } else if (second === "new") {
      crumbs.push({ label: "Add employee" });
    } else {
      crumbs.push({ label: "Person" });
    }
    return crumbs;
  }

  // Hiring + AI Studio
  if (first === "hiring") {
    const crumbs: Crumb[] = [{ label: "Hiring", href: "/hiring" }];

    if (!second) {
      return [...crumbs, { label: "Overview" }];
    }

    if (second === "ai-studio") {
      crumbs.push({ label: "AI Studio", href: "/hiring/ai-studio" });

      if (third === "job-intake") {
        crumbs.push({ label: "Job intake" });
      } else if (third === "job-description") {
        crumbs.push({ label: "Job description" });
      } else if (third === "candidate-summary") {
        crumbs.push({ label: "Candidate summary" });
      } else if (third === "performance-review") {
        crumbs.push({ label: "Performance review" });
      } else if (third === "onboarding-plan") {
        crumbs.push({ label: "Onboarding plan" });
      } else if (third === "resume-match") {
        crumbs.push({ label: "Resume match" });
      }

      return crumbs;
    }

    return [...crumbs, { label: "Hiring" }];
  }

  // Jobs
  if (first === "jobs") {
    const crumbs: Crumb[] = [{ label: "Hiring", href: "/hiring" }];
    if (!second) {
      crumbs.push({ label: "Jobs" });
    } else {
      crumbs.push({ label: "Jobs", href: "/jobs" }, { label: "Job" });
    }
    return crumbs;
  }

  // Candidates
  if (first === "candidates") {
    const crumbs: Crumb[] = [{ label: "Hiring", href: "/hiring" }];
    if (!second) {
      crumbs.push({ label: "Candidates" });
    } else {
      crumbs.push({ label: "Candidates", href: "/candidates" }, { label: "Candidate" });
    }
    return crumbs;
  }

  // Operations / Settings
  if (first === "operations") {
    return [{ label: "Operations", href: "/operations" }];
  }

  if (first === "settings") {
    return [
      { label: "Operations", href: "/operations" },
      { label: "Settings" },
    ];
  }

  // Fallback: just show segment name
  return [{ label: "Workspace" }, { label: segments.join(" / ") }];
}

/* --------------------------------------
   MOBILE NAV SECTIONS (mirrors sidebar)
--------------------------------------- */

type NavItem = { href: string; label: string; comingSoon?: boolean; icon?: string };
type NavSection = { label: string; items: NavItem[] };

const MOBILE_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "🏠" }],
  },
  {
    label: "People",
    items: [
      { href: "/people", label: "Directory", icon: "👥" },
      { href: "/timeoff", label: "Time off / PTO", icon: "🏝️" },
    ],
  },
  {
    label: "Hiring",
    items: [
      { href: "/hiring", label: "Hiring", icon: "📌" },
      { href: "/jobs", label: "Jobs", icon: "📋" },
      { href: "/candidates", label: "Candidates", icon: "🧑‍💼" },
      { href: "/hiring/ai-studio", label: "AI Studio", icon: "✨" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/operations", label: "Operations", icon: "⚙️" },
      { href: "/employee-documents", label: "Documents", icon: "📂" },
      { href: "/settings", label: "Settings", icon: "⚙︎" },
    ],
  },
];

export default function TopNav() {
  const rawPath = usePathname();
  const pathname = rawPath ?? "/";
  const meta = getMeta(pathname);
  const crumbs = getCrumbs(pathname);
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          {/* Left: mobile menu + breadcrumbs + title */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 md:hidden"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Intime pill (desktop only) */}
            <div className="hidden items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-sm md:flex">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Intime
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                HRIS
              </span>
            </div>

            {/* Breadcrumbs + title */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
                {crumbs.map((crumb, idx) => (
                  <span
                    key={`${crumb.label}-${idx}`}
                    className="inline-flex items-center gap-1"
                  >
                    <span>{crumb.label}</span>
                    {idx < crumbs.length - 1 && (
                      <span className="text-slate-300">/</span>
                    )}
                  </span>
                ))}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {meta.title}
                </span>
                {meta.subtitle && (
                  <span className="text-[11px] text-slate-400">
                    · {meta.subtitle}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: tagline + profile */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 md:inline">
              Early access · Designed for modern HR teams
            </span>
            <ProfileMenu
              name="Katherine Soroka"
              email="katherine@hireintime.ai"
            />
          </div>
        </div>
      </header>

      {/* Mobile slide-in nav (Rippling-ish) */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-200 shadow-xl md:hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-semibold text-slate-100 shadow-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Intime
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                  HR Platform
                </span>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex h-[calc(100%-3.5rem)] flex-col gap-4 overflow-y-auto px-2 pb-4">
              {MOBILE_SECTIONS.map((section) => (
                <div key={section.label} className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {section.label}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");

                      const baseClasses =
                        "group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition";

                      const stateClasses = active
                        ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white";

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`${baseClasses} ${stateClasses}`}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon && (
                              <span className="text-[15px] leading-none">
                                {item.icon}
                              </span>
                            )}
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-300">
                            →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
