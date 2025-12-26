"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  Briefcase,
  Calendar,
  ClipboardList,
  FileText,
  Settings,
  Sparkles,
  Shield,
  Radar,
  Search,
  Building2,
  GraduationCap,
  Wallet,
  Layers,
  Zap,
  BarChart3,
  ChevronDown,
  Bell,
  AlertCircle,
  Inbox,
  LayoutDashboard,
} from "lucide-react";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import api from "@/lib/api";
import { listTasks } from "@/lib/task-api";

type NavItem = {
  label: string;
  href: (orgSlug: string) => string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
};

const NAV: Array<{ section?: string; items: NavItem[] }> = [
  {
    section: "Overview",
    items: [
      { label: "Home", href: (org) => `/org/${org}/home`, icon: Home },
      { label: "Inbox", href: (org) => `/org/${org}/tasks`, icon: Inbox },
      { label: "Manager Home", href: (org) => `/org/${org}/manager`, icon: LayoutDashboard },
      { label: "Notifications", href: (org) => `/org/${org}/notifications`, icon: Bell },
    ],
  },
  {
    section: "People",
    items: [
      { label: "People hub", href: (org) => `/org/${org}/people`, icon: Users },
      { label: "Time off / PTO", href: (org) => `/org/${org}/time-off`, icon: Calendar },
      { label: "Policies", href: (org) => `/org/${org}/policies`, icon: ClipboardList, disabled: true },
      { label: "Requests", href: (org) => `/org/${org}/requests`, icon: ClipboardList, disabled: true },
      { label: "Calendar", href: (org) => `/org/${org}/calendar`, icon: Calendar, disabled: true },
    ],
  },
  {
    section: "Talent",
    items: [
      { label: "Talent hub", href: (org) => `/org/${org}/talent`, icon: Layers, disabled: true },
      { label: "Recruiting", href: (org) => `/org/${org}/hiring`, icon: Briefcase },
      { label: "Hiring cockpit", href: (org) => `/org/${org}/hiring/cockpit`, icon: LayoutDashboard },
      { label: "Hiring templates", href: (org) => `/org/${org}/hiring/templates`, icon: FileText },
      { label: "Headcount plans", href: (org) => `/org/${org}/headcount/plans`, icon: ClipboardList },
    ],
  },
  {
    section: "Core apps",
    items: [
      { label: "Performance", href: (org) => `/org/${org}/performance`, icon: BarChart3 },
      { label: "Jobs", href: (org) => `/org/${org}/jobs`, icon: Briefcase },
    ],
  },
  {
    section: "Platform",
    items: [
      { label: "Operations", href: (org) => `/org/${org}/operations`, icon: Building2, disabled: true },
      { label: "AI Studio", href: (org) => `/org/${org}/ai-studio`, icon: Sparkles },
      { label: "Payroll", href: (org) => `/org/${org}/payroll`, icon: Wallet },
      { label: "Learning", href: (org) => `/org/${org}/learning`, icon: GraduationCap },
      { label: "Learning automation", href: (org) => `/org/${org}/learning/automation`, icon: Zap },
      { label: "Learning inbox", href: (org) => `/org/${org}/learning/inbox`, icon: Bell },
      { label: "Leaderboard", href: (org) => `/org/${org}/learning/leaderboard`, icon: AlertCircle },
      { label: "Documents", href: (org) => `/org/${org}/documents`, icon: FileText, disabled: true },
      { label: "Obsession", href: (org) => `/org/${org}/obsession`, icon: Zap, disabled: true },
    ],
  },
  {
    section: "Insights",
    items: [
      { label: "Intelligence", href: (org) => `/org/${org}/intelligence`, icon: Radar },
      { label: "Decisions", href: (org) => `/org/${org}/intelligence/decisions`, icon: BarChart3 },
      { label: "Weekly snapshot", href: (org) => `/org/${org}/intelligence/weekly`, icon: Calendar },
      { label: "Narrative", href: (org) => `/org/${org}/intelligence/narrative`, icon: Calendar },
      { label: "Ops", href: (org) => `/org/${org}/ops`, icon: Shield },
      { label: "Deploy Check", href: (org) => `/org/${org}/ops/deploy`, icon: Shield },
    ],
  },
  {
    section: "Setup",
    items: [{ label: "Onboarding", href: (org) => `/org/${org}/onboarding`, icon: ClipboardList }],
  },
];

const BOTTOM: NavItem[] = [
  { label: "AI Workspace", href: (org) => `/org/${org}/ai`, icon: Sparkles },
  { label: "Intelligence Suite", href: (org) => `/org/${org}/intelligence`, icon: Shield, badge: "AI", disabled: true },
  { label: "Settings", href: (org) => `/org/${org}/settings`, icon: Settings },
  { label: "Members", href: (org) => `/org/${org}/settings/members`, icon: Users },
  { label: "Audit log", href: (org) => `/org/${org}/settings/audit-log`, icon: Shield },
  { label: "Email", href: (org) => `/org/${org}/settings/email`, icon: Shield },
  { label: "Data exports", href: (org) => `/org/${org}/settings/data`, icon: Shield },
  { label: "Support", href: (org) => `/org/${org}/settings/support`, icon: Shield },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function OrgSidebar({ orgSlug }: { orgSlug?: string }) {
  const pathname = usePathname() ?? "";
  const params = useParams<{ orgSlug?: string }>();
  const { isOwner, isAdmin, role } = useCurrentOrg();

  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const [taskBadge, setTaskBadge] = useState<number | null>(null);
  const [notifBadge, setNotifBadge] = useState<number | null>(null);

  const resolvedOrgSlug = orgSlug ?? params?.orgSlug ?? "";
  const isOpsAllowed = isOwner || isAdmin;

  useEffect(() => {
    if (!resolvedOrgSlug) return;
    let cancelled = false;

    async function load() {
      try {
        const res: any = await api.get(`/orgs/${resolvedOrgSlug}/onboarding`);
        const percent =
          typeof res?.progressPercent === "number"
            ? res.progressPercent
            : (() => {
                const steps = Array.isArray(res?.steps) ? res.steps : [];
                if (!steps.length) return null;
                const completed = steps.filter((s: any) => s?.completed).length;
                return Math.round((completed / steps.length) * 100);
              })();

        if (!cancelled) setOnboardingVisible(percent === null || percent < 100);
      } catch {
        if (!cancelled) setOnboardingVisible(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [resolvedOrgSlug]);

  useEffect(() => {
    if (!resolvedOrgSlug) return;
    let cancelled = false;

    async function loadNotifs() {
      try {
        const mod = await import("@/lib/notifications-api");
        const count = await mod.unreadCount(resolvedOrgSlug);
        if (!cancelled) setNotifBadge(typeof count === "number" ? count : null);
      } catch {
        if (!cancelled) setNotifBadge(null);
      }
    }

    void loadNotifs();
    const handler = () => void loadNotifs();
    window.addEventListener("notifications:updated", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("notifications:updated", handler);
    };
  }, [resolvedOrgSlug]);

  useEffect(() => {
    if (!resolvedOrgSlug) return;
    let cancelled = false;

    async function loadTasks() {
      try {
        const res = await listTasks(resolvedOrgSlug, { status: "OPEN" });
        if (!cancelled) setTaskBadge(Array.isArray(res) ? res.length : 0);
      } catch {
        if (!cancelled) setTaskBadge(null);
      }
    }

    void loadTasks();
    const handler = () => void loadTasks();
    window.addEventListener("tasks:updated", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("tasks:updated", handler);
    };
  }, [resolvedOrgSlug]);

  const showOnboarding = isOwner || isAdmin || onboardingVisible;

  if (!resolvedOrgSlug) return null;

  return (
    <aside className="pointer-events-auto relative z-50 hidden h-screen w-[260px] shrink-0 lg:flex lg:flex-col">
      <div className="pointer-events-auto flex h-full flex-col border-r border-slate-900 bg-slate-950">
        {/* Top */}
        <div className="px-4 pt-4 pointer-events-auto">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-100 ring-1 ring-slate-800">
                <AlertCircle className="h-4 w-4 text-blue-400" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-100">Intime</div>
                <div className="text-xs text-slate-500">HR Platform</div>
              </div>
            </div>
            <button
              type="button"
              className="pointer-events-auto rounded-lg p-2 text-slate-500 hover:bg-slate-900 hover:text-slate-200"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3 pointer-events-auto">
            <button
              type="button"
              className="pointer-events-auto flex w-full items-center justify-between rounded-xl bg-slate-900/30 px-3 py-2 hover:bg-slate-900/50"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-200">Your org</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-600" />
            </button>

            <button
              type="button"
              className="pointer-events-auto flex w-full items-center gap-2 rounded-xl bg-slate-900/30 px-3 py-2 hover:bg-slate-900/50"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span className="text-xs text-slate-400">Search or jump to…</span>
              <span className="ml-auto rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-800">
                ⌘K
              </span>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="pointer-events-auto mt-5 flex-1 overflow-y-auto px-3 pb-3">
          {NAV.map((group, idx) => (
            <div key={idx} className="mb-5 pointer-events-auto">
              {group.section && (
                <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {group.section}
                </div>
              )}

              <div className="space-y-1 pointer-events-auto">
                {group.items.map((item) => {
                  if (item.label === "Onboarding" && !showOnboarding) return null;
                  if (item.label === "Ops" && !isOpsAllowed) return null;

                  if (item.label === "Manager Home") {
                    const r = (role || "").toUpperCase();
                    if (!(r === "MANAGER" || r === "ADMIN" || r === "OWNER")) return null;
                  }

                  const href = item.href(resolvedOrgSlug);
                  const active = isActive(pathname, href);
                  const Icon = item.icon;

                  const base = "pointer-events-auto group flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition";
                  const enabled = active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white";
                  const disabled = "text-slate-600 cursor-not-allowed opacity-60";
                  const iconClass = active ? "text-white" : "text-slate-500 group-hover:text-slate-300";
                  const content = (
                    <>
                      <span className={cx("h-2 w-2 rounded-full", active ? "bg-white" : "bg-slate-700")} />
                      <Icon className={cx("h-4 w-4", iconClass)} />
                      <span className="truncate font-medium">{item.label}</span>
                      {item.label === "Inbox" && taskBadge != null ? (
                        <span className="ml-auto rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {taskBadge}
                        </span>
                      ) : item.label === "Notifications" && notifBadge != null ? (
                        <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {notifBadge}
                        </span>
                      ) : item.badge ? (
                        <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  );

                  if (item.disabled) {
                    return (
                      <div key={item.label} className={cx(base, disabled)}>
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link key={item.label} href={href} className={cx(base, enabled)}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-2 space-y-1 pointer-events-auto">
            {BOTTOM.filter((item) => {
              if (
                item.label === "Members" ||
                item.label === "Audit log" ||
                item.label === "Email" ||
                item.label === "Data exports"
              ) {
                return isOwner || isAdmin;
              }
              return true;
            }).map((item) => {
              const href = item.href(resolvedOrgSlug);
              const active = isActive(pathname, href);
              const Icon = item.icon;

              const base = "pointer-events-auto group flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition";
              const enabled = active
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-900 hover:text-white";
              const disabled = "text-slate-600 cursor-not-allowed opacity-60";
              const iconClass =
                active
                  ? "text-white"
                  : item.label === "AI Workspace"
                  ? "text-blue-400"
                  : "text-slate-500 group-hover:text-slate-300";

              const content = (
                <>
                  <span className={cx("h-2 w-2 rounded-full", active ? "bg-white" : "bg-slate-700")} />
                  <Icon className={cx("h-4 w-4", iconClass)} />
                  <span className="truncate font-medium">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              );

              if (item.disabled) {
                return (
                  <div key={item.label} className={cx(base, disabled)}>
                    {content}
                  </div>
                );
              }

              return (
                <Link key={item.label} href={href} className={cx(base, enabled)}>
                  {content}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="pointer-events-auto border-t border-slate-900 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
              D
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-slate-100">demo</div>
              <div className="truncate text-[11px] text-slate-500">demo@intime.ai</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
