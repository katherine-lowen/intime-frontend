// src/components/figma/ui/TimelineActivity.tsx
"use client";

import Link from "next/link";

type Activity = {
  id: string;
  title: string;
  description: string;
  actor: string;
  timeAgo: string;
  iconEmoji: string;
  iconBgClass: string; // gradient circle class
  href: string;
};

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Employee Added",
    description: "John Smith joined Engineering.",
    actor: "System",
    timeAgo: "15 min ago",
    iconEmoji: "👤",
    iconBgClass: "orb-gradient-blue",
    href: "/people",
  },
  {
    id: "2",
    title: "Time Off Approved",
    description: "Sarah Chen • Dec 20–27",
    actor: "You",
    timeAgo: "15 min ago",
    iconEmoji: "📅",
    iconBgClass: "orb-gradient-emerald",
    href: "/timeoff",
  },
  {
    id: "3",
    title: "Role Opened",
    description: "Senior Product Designer",
    actor: "Hiring",
    timeAgo: "1 hour ago",
    iconEmoji: "🎯",
    iconBgClass: "orb-gradient-purple",
    href: "/jobs",
  },
  {
    id: "4",
    title: "Profile Updated",
    description: "Michael Torres changed teams.",
    actor: "System",
    timeAgo: "3 hours ago",
    iconEmoji: "✏️",
    iconBgClass: "orb-gradient-cyan",
    href: "/people",
  },
];

export function TimelineActivity() {
  return (
    <section className="glass-card rounded-3xl p-5 sm:p-6 lg:p-7 h-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Activity
        </h2>
        <Link
          href="/activity" // adjust if you have a different route
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          View all
        </Link>
      </div>

      {/* Scrollable list */}
      <div className="relative max-h-[560px] overflow-y-auto pr-2 scrollbar-glass">
        {/* Slim rail on the left */}
        <div className="pointer-events-none absolute left-4 top-0 bottom-0 w-[3px] rounded-full bg-sky-100" />

        <div className="space-y-4">
          {ACTIVITIES.map((item) => (
            <div key={item.id} className="relative pl-6">
              {/* Node bullet on rail */}
              <div className="pointer-events-none absolute left-3 top-1.5 flex h-3 w-3 items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" />
              </div>

              {/* Clickable card */}
              <Link
                href={item.href}
                className="group block rounded-2xl bg-white/95 px-4 py-3.5 shadow-sm ring-1 ring-slate-100/90 transition
                           hover:-translate-y-[1px] hover:shadow-md hover:ring-sky-100/90"
              >
                <div className="flex items-center gap-3.5">
                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-base text-white ${item.iconBgClass} shadow-sm`}
                  >
                    <span className="translate-y-[1px]">{item.iconEmoji}</span>
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-medium text-slate-400">
                        {item.timeAgo}
                      </span>
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                      {item.description}
                    </p>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>via {item.actor}</span>
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View raw</span>
                        <span className="text-[9px]">↗</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
