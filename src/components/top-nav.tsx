// src/components/top-nav.tsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Bell,
  HelpCircle,
  Keyboard,
  ArrowRight,
} from "lucide-react";
import ProfileMenu from "@/components/profile-menu";

/* --------------------------------------
   Stored user (from auth)
--------------------------------------- */

const USER_KEY = "intime_user";

type StoredUser = {
  id: string;
  email: string;
  name?: string | null;
  orgId?: string;
  role?: string;
};

/* --------------------------------------
   LABEL META + CRUMBS
--------------------------------------- */

type LabelMeta = {
  title: string;
  section: string;
  subtitle?: string;
};

const BASE_LABELS: Record<string, LabelMeta> = {
  "/": {
    title: "Dashboard",
    section: "Overview",
    subtitle: "Org-wide snapshot",
  },
  "/dashboard": {
    title: "Dashboard",
    section: "Overview",
    subtitle: "Org-wide snapshot",
  },

  "/people": {
    title: "Directory",
    section: "People",
    subtitle: "Everyone in your org",
  },
  "/people/new": {
    title: "Add employee",
    section: "People",
    subtitle: "Create a new profile",
  },

  "/jobs": {
    title: "Jobs",
    section: "Talent",
    subtitle: "Open roles & pipelines",
  },
  "/candidates": {
    title: "Candidates",
    section: "Talent",
    subtitle: "Applicants & interviews",
  },
  "/hiring": {
    title: "Hiring home",
    section: "Talent",
    subtitle: "Recruiting workspace",
  },

  "/hiring/ai-studio": {
    title: "AI Studio",
    section: "Talent",
    subtitle: "AI-native workflows",
  },

  "/talent": {
    title: "Talent overview",
    section: "Talent",
    subtitle: "Org-wide talent programs",
  },

  "/operations": {
    title: "Operations",
    section: "Platform",
    subtitle: "Analytics & configuration",
  },

  "/employee-documents": {
    title: "Documents",
    section: "Platform",
    subtitle: "Employee files & records",
  },

  "/settings": {
    title: "Settings",
    section: "Platform",
    subtitle: "Org & workspace settings",
  },

  "/timeoff": {
    title: "Time off",
    section: "People",
    subtitle: "Policies & requests",
  },
  "/help": { title: "Help & support", section: "Support" },
};

type Crumb = { label: string; href?: string };

function getMeta(pathname: string): LabelMeta {
  const basePath = pathname.split("?")[0];

  if (BASE_LABELS[basePath]) return BASE_LABELS[basePath];

  if (basePath.startsWith("/people/")) {
    return { title: "Person", section: "People", subtitle: "Employee profile" };
  }

  if (basePath.startsWith("/jobs/")) {
    return { title: "Job", section: "Talent", subtitle: "Job detail" };
  }

  if (basePath.startsWith("/candidates/")) {
    return {
      title: "Candidate",
      section: "Talent",
      subtitle: "Candidate detail",
    };
  }

  return { title: "Workspace", section: "Intime", subtitle: "HR platform" };
}

function getCrumbs(pathname: string): Crumb[] {
  const path = pathname.split("?")[0];
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] === "dashboard") {
    return [
      { label: "Overview", href: "/dashboard" },
      { label: "Dashboard" },
    ];
  }

  const [first] = segments;

  if (first === "people") {
    return [
      { label: "People", href: "/people" },
      { label: "Directory" },
    ];
  }

  if (first === "hiring") {
    return [
      { label: "Talent", href: "/talent" },
      { label: "Hiring" },
    ];
  }

  if (first === "jobs") {
    return [
      { label: "Talent", href: "/talent" },
      { label: "Jobs" },
    ];
  }

  if (first === "candidates") {
    return [
      { label: "Talent", href: "/talent" },
      { label: "Candidates" },
    ];
  }

  if (first === "talent") return [{ label: "Talent overview" }];

  if (first === "operations") return [{ label: "Operations" }];

  return [{ label: "Workspace" }];
}

/* --------------------------------------
   COMMAND PALETTE DATA
--------------------------------------- */

type CommandItem = {
  label: string;
  href: string;
  group: string;
  description?: string;
  shortcut?: string;
  icon?: string;
  keywords?: string;
};

const COMMANDS: CommandItem[] = [
  // Overview
  {
    label: "Dashboard",
    href: "/dashboard",
    group: "Overview",
    description: "Org-wide snapshot of people, jobs, and time",
    icon: "🏠",
    keywords: "home overview",
  },

  // People
  {
    label: "People directory",
    href: "/people",
    group: "People",
    description: "View everyone in your org",
    icon: "👥",
    keywords: "employees staff directory",
  },
  {
    label: "Time off / PTO",
    href: "/timeoff",
    group: "People",
    description: "Policies, balances, and requests",
    icon: "🏝️",
    keywords: "pto vacation leave",
  },

  // Talent
  {
    label: "Talent overview",
    href: "/talent",
    group: "Talent",
    description: "High-level view of talent programs",
    icon: "⭐",
    keywords: "talent hub",
  },
  {
    label: "Recruiting workspace",
    href: "/hiring",
    group: "Talent",
    description: "Jobs, pipelines, and interview flows",
    icon: "📌",
    keywords: "hiring ats",
  },
  {
    label: "Jobs",
    href: "/jobs",
    group: "Talent",
    description: "Manage open roles and drafts",
    icon: "📋",
  },
  {
    label: "Candidates",
    href: "/candidates",
    group: "Talent",
    description: "All applicants and their status",
    icon: "🧑‍💼",
  },
  {
    label: "AI Studio",
    href: "/hiring/ai-studio",
    group: "Talent",
    description: "AI tools for job intake, summaries, and more",
    icon: "✨",
    keywords: "ai tools studio",
  },
  {
    label: "Headcount planning",
    href: "/talent/headcount",
    group: "Talent",
    description: "Forecast roles by team",
    icon: "👥",
  },
  {
    label: "Review cycles",
    href: "/talent/review-cycles",
    group: "Talent",
    description: "Design performance review waves",
    icon: "📆",
  },

  // Platform
  {
    label: "Operations",
    href: "/operations",
    group: "Platform",
    description: "HR operations & workflows",
    icon: "⚙️",
  },
  {
    label: "Employee documents",
    href: "/employee-documents",
    group: "Platform",
    description: "Contracts, paperwork, and files",
    icon: "📂",
  },
  {
    label: "Settings",
    href: "/settings",
    group: "Platform",
    description: "Org & workspace configuration",
    icon: "⚙️",
  },
];

/* --------------------------------------
   TOP NAV + COMMAND PALETTE
--------------------------------------- */

export default function TopNav() {
  const router = useRouter();
  const rawPath = usePathname();
  const pathname = rawPath ?? "/";

  // Hide top nav on auth + signup flows
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthRoute) {
    return null;
  }

  const meta = getMeta(pathname);
  const crumbs = getCrumbs(pathname);
  // (rest of your component stays the same)

  const [mobileOpen, setMobileOpen] = useState(false);

  // command palette state
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // user identity from localStorage
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredUser;
      setUser(parsed);
    } catch (e) {
      console.warn("[TopNav] Failed to parse stored user", e);
    }
  }, []);

  const displayName =
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "Guest");
  const displayEmail = user?.email || "unknown@example.com";
  const orgName = "Intime workspace";

  // keyboard shortcuts: ⌘K / Ctrl+K + Esc
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && isK) {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
        setQuery("");
      }

      if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // focus input when palette opens
  useEffect(() => {
    if (paletteOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [paletteOpen]);

  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COMMANDS;
    return COMMANDS.filter((cmd) => {
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.group.toLowerCase().includes(q) ||
        (cmd.keywords && cmd.keywords.toLowerCase().includes(q))
      );
    });
  }, [query]);

  const handleSelect = (cmd: CommandItem) => {
    setPaletteOpen(false);
    setQuery("");
    router.push(cmd.href);
  };

  return (
    <>
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-4 md:gap-6">
          {/* LEFT: MENU + BREADCRUMBS */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Breadcrumbs + current title (desktop) */}
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                {crumbs.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    {c.href ? (
                      <Link href={c.href} className="hover:text-slate-300">
                        {c.label}
                      </Link>
                    ) : (
                      <span>{c.label}</span>
                    )}
                    {i < crumbs.length - 1 && (
                      <span className="text-slate-600">/</span>
                    )}
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold text-white">
                {meta.title}
              </span>
            </div>
          </div>

          {/* CENTER: SEARCH TRIGGER (desktop) */}
          <div className="hidden md:flex flex-1 justify-center">
            <button
              type="button"
              onClick={() => {
                setPaletteOpen(true);
                setQuery("");
              }}
              className="group relative flex w-full max-w-lg items-center gap-2 rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span className="flex-1 text-xs text-slate-400 group-hover:text-slate-300">
                Search or jump to…
              </span>
              <span className="hidden items-center gap-1 rounded-md border border-slate-600 px-1.5 py-0.5 text-[10px] text-slate-300 md:inline-flex">
                ⌘K
              </span>
            </button>
          </div>

          {/* RIGHT: ORG BADGE + ICONS + PROFILE */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Org pill */}
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Workspace
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-200">
                {orgName}
              </span>
            </div>

            <HelpCircle className="text-slate-300 h-4 w-4 hover:text-white cursor-pointer hidden md:block" />
            <Keyboard className="text-slate-300 h-4 w-4 hover:text-white cursor-pointer hidden md:block" />
            <Bell className="text-slate-300 h-4 w-4 hover:text-white cursor-pointer hidden md:block" />

            <ProfileMenu name={displayName} email={displayEmail} />
          </div>
        </div>
      </header>

      {/* GLOBAL COMMAND PALETTE OVERLAY */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-24 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Input row */}
            <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people, jobs, or workspaces…"
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <span className="hidden items-center gap-1 rounded-md border border-slate-600 px-1.5 py-0.5 text-[10px] text-slate-300 md:inline-flex">
                Esc
              </span>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto px-2 py-2 text-xs">
              {filteredCommands.length === 0 && (
                <div className="px-3 py-4 text-slate-500">
                  No matches yet. Try “jobs”, “talent”, or “time off”.
                </div>
              )}

              {filteredCommands.length > 0 && (
                <div className="space-y-2">
                  {["Overview", "People", "Talent", "Platform"].map((group) => {
                    const groupItems = filteredCommands.filter(
                      (c) => c.group === group
                    );
                    if (!groupItems.length) return null;

                    return (
                      <div key={group}>
                        <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {group}
                        </div>
                        <ul className="space-y-1">
                          {groupItems.map((cmd) => (
                            <li key={cmd.href}>
                              <button
                                type="button"
                                onClick={() => handleSelect(cmd)}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-slate-100 hover:bg-slate-800/80"
                              >
                                <div className="flex items-center gap-3">
                                  {cmd.icon && (
                                    <span className="text-base leading-none">
                                      {cmd.icon}
                                    </span>
                                  )}
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {cmd.label}
                                    </span>
                                    {cmd.description && (
                                      <span className="text-[11px] text-slate-400">
                                        {cmd.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="h-3 w-3 text-slate-500" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOTE: mobile sidebar state is kept here if you want to wire it later. */}
    </>
  );
}
