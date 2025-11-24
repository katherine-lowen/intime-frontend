// src/components/sidebar.tsx
"use client";

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

const SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "🏠" }],
  },
  {
    label: "People",
    items: [
      { href: "/people", label: "Directory", icon: "👥" },
      { href: "#", label: "Performance", comingSoon: true, icon: "📊" },
      { href: "/timeoff", label: "Time off / PTO", icon: "🏝️" },
      { href: "#", label: "Org chart", comingSoon: true, icon: "🗺️" },
    ],
  },
  {
    label: "Hiring",
    items: [
      { href: "/hiring", label: "Hiring", icon: "📌" },
      { href: "/jobs", label: "Jobs", icon: "📋" },
      { href: "/candidates", label: "Candidates", icon: "🧑‍💼" },
      { href: "/hiring/ai-studio", label: "AI Studio", icon: "✨" },
      { href: "#", label: "Interview plans", comingSoon: true, icon: "📝" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/operations", label: "Operations", icon: "⚙️" },
      { href: "/employee-documents", label: "Documents", icon: "📂" },
      { href: "#", label: "Analytics", comingSoon: true, icon: "📈" },
      { href: "#", label: "Payroll", comingSoon: true, icon: "💸" },
      { href: "#", label: "Settings", comingSoon: true, icon: "⚙︎" },
    ],
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname() ?? "";

  /* -------------------------------
     DESKTOP VERSION (always visible)
  --------------------------------*/
  return (
    <>
      <div className="hidden w-64 md:flex md:flex-col">
        <DesktopSidebar pathname={pathname} />
      </div>

      {/* -------------------------------------
          MOBILE SLIDE-IN SIDEBAR (Rippling-style)
      --------------------------------------*/}
      <AnimatePresence>
        {open && (
          <>
            {/* Background overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Sliding drawer */}
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

                const baseClasses =
                  "group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition";

                const stateClasses = active
                  ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white";

                return (
                  <Link
                    key={item.label}
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
