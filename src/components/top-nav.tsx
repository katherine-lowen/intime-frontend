// src/components/top-nav.tsx
"use client";

import { usePathname } from "next/navigation";
import ProfileMenu from "@/components/profile-menu";

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
  const segments = path.split("/").filter(Boolean); // ["hiring","ai-studio","job-intake"]

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

export default function TopNav() {
  const rawPath = usePathname();
  const pathname = rawPath ?? "/";
  const meta = getMeta(pathname);
  const crumbs = getCrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Left: app pill + breadcrumbs + title */}
        <div className="flex items-center gap-3">
          {/* Intime pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Intime
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
              HRIS
            </span>
          </div>

          {/* Breadcrumbs + title */}
          <div className="flex flex-col">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
              {crumbs.map((crumb, idx) => (
                <span key={`${crumb.label}-${idx}`} className="inline-flex items-center gap-1">
                  <span>{crumb.label}</span>
                  {idx < crumbs.length - 1 && (
                    <span className="text-slate-300">/</span>
                  )}
                </span>
              ))}
            </div>

            {/* Title + subtitle */}
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
  );
}
