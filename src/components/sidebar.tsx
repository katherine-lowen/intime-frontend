"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
  href: string;
  label: string;
  comingSoon?: boolean;
  icon?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

type FlyoutKey = "people" | "talent" | "platform" | null;

type FlyoutItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
};

/* -----------------------
   Flyout contents
------------------------ */

// People hub: directory, onboarding, PTO, org chart, performance
const PEOPLE_FLYOUT_ITEMS: FlyoutItem[] = [
  {
    href: "/people",
    label: "Directory",
    description: "Everyone in your org, in one place.",
    icon: "👥",
  },
  {
    href: "/onboarding",
    label: "Onboarding",
    description: "Track new hire flows and checklists.",
    icon: "🧭",
  },
  {
    href: "/timeoff",
    label: "Time off / PTO",
    description: "Policies, balances, and requests.",
    icon: "🏝️",
  },
  {
    href: "#",
    label: "Org chart",
    description: "Visualize reporting lines. (Coming soon)",
    icon: "🗺️",
  },
  {
    href: "#",
    label: "Performance",
    description: "Reviews and feedback cycles. (Coming soon)",
    icon: "📊",
  },
];

// Talent hub: recruiting + planning + templates
const TALENT_FLYOUT_ITEMS: FlyoutItem[] = [
  {
    href: "/talent",
    label: "Talent overview",
    description: "Headcount, performance, and engagement in one view.",
    icon: "⭐",
  },
  {
    href: "/hiring",
    label: "Recruiting workspace",
    description: "Jobs, pipelines, and interview flows.",
    icon: "📌",
  },
  {
    href: "/jobs",
    label: "Jobs",
    description: "Manage open roles and drafts.",
    icon: "📋",
  },
  {
    href: "/candidates",
    label: "Candidates",
    description: "Track applicants and interview progress.",
    icon: "🧑‍💼",
  },
  {
    href: "/onboarding/templates",
    label: "Onboarding templates",
    description: "Reusable checklists for role-based onboarding.",
    icon: "🧩",
  },
  {
    href: "/talent/headcount",
    label: "Headcount planning",
    description: "Forecast roles and hiring by team. (Coming soon)",
    icon: "👥",
  },
  {
    href: "/talent/review-cycles",
    label: "Review cycles",
    description: "Design and run performance waves. (Coming soon)",
    icon: "📆",
  },
  {
    href: "/hiring/ai-studio",
    label: "AI Studio",
    description: "AI tools for intake, JDs, and summaries.",
    icon: "✨",
  },
];

// Platform hub: operations, payroll, docs, settings, analytics
const PLATFORM_FLYOUT_ITEMS: FlyoutItem[] = [
  {
    href: "/operations",
    label: "Operations",
    description: "HR operations, workflows, and insights.",
    icon: "⚙️",
  },
  {
    href: "/payroll",
    label: "Payroll & compensation",
    description: "Pay schedules, comp, and providers.",
    icon: "💸",
  },
  {
    href: "/employee-documents",
    label: "Employee documents",
    description: "Contracts, paperwork, and files.",
    icon: "📂",
  },
  {
    href: "/obsession",
    label: "Obsession log",
    description: "Internal feed of key submissions.",
    icon: "🧠",
  },
  {
    href: "/settings",
    label: "Company settings",
    description: "Org & workspace configuration.",
    icon: "⚙︎",
  },
  {
    href: "#",
    label: "Analytics",
    description: "Org-wide reporting and metrics. (Coming soon)",
    icon: "📈",
  },
  {
    href: "#",
    label: "Help",
    description: "Guides, FAQs, and support. (Coming soon)",
    icon: "❓",
  },
];

/* -----------------------
   Sidebar sections
   (clean, non-duplicative)
------------------------ */

const SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Home", icon: "🏠" }],
  },

  {
    label: "People",
    items: [
      // Flyout anchor
      { href: "/people", label: "People hub", icon: "👥" },
      // Key quick-links
      { href: "/onboarding", label: "Onboarding", icon: "🧭" },
      { href: "/timeoff", label: "Time off / PTO", icon: "🏝️" },
    ],
  },

  {
    label: "Talent",
    items: [
      // Flyout anchor
      { href: "/talent", label: "Talent hub", icon: "⭐" },
      // Key quick-links
      { href: "/hiring", label: "Recruiting", icon: "📌" },
      {
        href: "/onboarding/templates",
        label: "Onboarding templates",
        icon: "🧩",
      },
    ],
  },

  {
    label: "Platform",
    items: [
      // Flyout anchor
      { href: "/operations", label: "Operations", icon: "⚙️" },
      { href: "/payroll", label: "Payroll", icon: "💸" },
      { href: "/employee-documents", label: "Documents", icon: "📂" },
      { href: "/obsession", label: "Obsession", icon: "🧠" },
      { href: "/settings", label: "Settings", icon: "⚙︎" },
    ],
  },
];

/* -----------------------
   Sidebar root
------------------------ */

export function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname() ?? "";

  // Hide sidebar (and its reserved space) on auth + signup flows
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthRoute) {
    return null;
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden w-64 md:flex md:flex-col">
        <DesktopSidebar pathname={pathname} />
      </div>

      {/* Mobile slide-in sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Drawer */}
            <motion.div
              className="fixed left-0 top-0 z-50 h-full w-72 md:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <MobileSidebar pathname={pathname} onClose={onClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


/* ------------------------------
   SHARED SIDEBAR CONTENT
------------------------------*/
function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const [hoveredFlyout, setHoveredFlyout] = useState<FlyoutKey>(null);

  const openFlyout = (key: FlyoutKey) => setHoveredFlyout(key);
  const closeFlyout = (key: FlyoutKey) => {
    if (hoveredFlyout === key) setHoveredFlyout(null);
  };

  return (
    <div className="flex min-h-full flex-col gap-5 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-200">
      {/* Brand */}
      <div className="px-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-semibold text-slate-100 shadow-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Intime
          <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-300">
            HR Platform
          </span>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          People, hiring, and time-aware insights.
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
        {SECTIONS.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isRealLink = item.href !== "#";
                const active =
                  isRealLink &&
                  (pathname === item.href ||
                    pathname.startsWith(item.href + "/"));

                const isPeopleHub = item.href === "/people";
                const isTalentHub = item.href === "/talent";
                const isPlatformHub = item.href === "/operations";

                const baseClasses =
                  "group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition";

                const stateClasses = active
                  ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white";

                const flyoutKey: FlyoutKey = isPeopleHub
                  ? "people"
                  : isTalentHub
                  ? "talent"
                  : isPlatformHub
                  ? "platform"
                  : null;

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => {
                      if (flyoutKey) openFlyout(flyoutKey);
                    }}
                    onMouseLeave={() => {
                      if (flyoutKey) closeFlyout(flyoutKey);
                    }}
                  >
                    <Link
                      href={isRealLink ? item.href : pathname || "/"}
                      onClick={onClose}
                      aria-disabled={!isRealLink}
                      className={[
                        baseClasses,
                        stateClasses,
                        !isRealLink &&
                          "cursor-default opacity-60 hover:bg-transparent",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && (
                          <span className="text-[15px] leading-none">
                            {item.icon}
                          </span>
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.comingSoon && (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-200">
                          Coming soon
                        </span>
                      )}
                    </Link>

                    {/* Desktop flyouts */}
                    {flyoutKey && hoveredFlyout === flyoutKey && (
                      <Flyout
                        kind={flyoutKey}
                        items={
                          flyoutKey === "people"
                            ? PEOPLE_FLYOUT_ITEMS
                            : flyoutKey === "talent"
                            ? TALENT_FLYOUT_ITEMS
                            : PLATFORM_FLYOUT_ITEMS
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-4 text-[10px] text-slate-500">
        © {new Date().getFullYear()} Intime · Early access
      </div>
    </div>
  );
}

/* -----------------------
   Flyout component
------------------------ */

function Flyout({
  kind,
  items,
}: {
  kind: Exclude<FlyoutKey, null>;
  items: FlyoutItem[];
}) {
  const title =
    kind === "people"
      ? "People"
      : kind === "talent"
      ? "Talent workspace"
      : "Platform";

  return (
    <div className="pointer-events-none absolute left-full top-0 hidden h-full md:block">
      <div className="pointer-events-auto ml-2 w-72 rounded-2xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-100 shadow-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </span>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">
            Apps
          </span>
        </div>
        <div className="space-y-1">
          {items.map((fly) => (
            <Link
              key={fly.href + fly.label}
              href={fly.href}
              className="flex items-start gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-slate-800/80"
            >
              <span className="mt-0.5 text-base">{fly.icon}</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-50">
                  {fly.label}
                </span>
                <span className="text-[11px] text-slate-400">
                  {fly.description}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Desktop and Mobile wrappers */

function DesktopSidebar({ pathname }: { pathname: string }) {
  return <SidebarContent pathname={pathname} />;
}

function MobileSidebar({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return <SidebarContent pathname={pathname} onClose={onClose} />;
}
