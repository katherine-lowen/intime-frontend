// src/app/dashboard/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import EventsFeed from "@/components/events-feed";
import { AuthGate } from "@/components/dev-auth-gate";
import {
  Users,
  Briefcase,
  CalendarClock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

type StatsResponse = {
  employees?: number;
  teams?: number;
  openRoles?: number;
  events?: number;
};

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

async function fetchStats(): Promise<Required<StatsResponse>> {
  try {
    const data = await api.get<StatsResponse>("/stats");
    return {
      employees: data.employees ?? 0,
      teams: data.teams ?? 0,
      openRoles: data.openRoles ?? 0,
      events: data.events ?? 0,
    };
  } catch (err) {
    console.error("Failed to load /stats, using demo values", err);
    // demo fallback so dashboard always looks alive
    return { employees: 34, teams: 8, openRoles: 12, events: 124 };
  }
}

// We only need a small slice of recent events for the “This week” panel
async function fetchRecentEvents(limit = 30): Promise<EventItem[]> {
  try {
    // backend already supports ?limit on /events in your other views
    const data = await api.get<EventItem[]>(`/events?limit=${limit}`);
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    console.error("Failed to load recent /events for dashboard", err);
    return [];
  }
}

export default async function DashboardPage() {
  const [stats, events] = await Promise.all([
    fetchStats(),
    fetchRecentEvents(40),
  ]);

  const { employees, teams, openRoles, events: eventsTotal } = stats;

  const avgTeamSize =
    teams > 0 ? Math.round((employees / teams) * 10) / 10 : employees;
  const eventsPerEmployee =
    employees > 0 ? Math.round((eventsTotal / employees) * 10) / 10 : 0;
  const openRolesPer100 =
    employees > 0 ? Math.round((openRoles / employees) * 10000) / 100 : 0;

  // Simple “this week” rollup by event type
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const recent = events.filter((e) => {
    if (!e.createdAt) return false;
    const t = Date.parse(e.createdAt);
    return !Number.isNaN(t) && t >= sevenDaysAgo;
  });

  const byType = recent.reduce<Record<string, number>>((acc, e) => {
    const key = e.type || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1]);

  return (
    <AuthGate>
      <div className="relative min-h-screen">
        {/* background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-slate-50" />

        <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
          {/* Hero */}
          <section>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Intime dashboard
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                      Live
                    </span>
                  </div>
                  <h1 className="font-semibold text-display-32 text-neutral-900">
                    One place for people, time, and hiring health.
                  </h1>
                  <p className="mt-1 text-body-14 text-neutral-600">
                    Your headcount, hiring pipeline, and time-aware events in a
                    single snapshot. See what needs your attention today.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      HRIS · Employees &amp; teams
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      Events · Time off, hiring, changes
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      AI · Narrative insights
                    </span>
                  </div>
                </div>

                {/* Customer-facing quick actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/people/new"
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-[11px] font-semibold text-neutral-50 shadow-sm hover:bg-neutral-800"
                  >
                    Add first employee
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/jobs/new"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    Create a role
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Company snapshot row */}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)]">
            {/* Core numbers */}
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                icon={<Users className="h-4 w-4" />}
                label="Headcount"
                value={employees}
                helper={`Across ${teams || 1} team${
                  teams === 1 ? "" : "s"
                } · avg ${avgTeamSize || 0} people per team`}
                state={employees === 0 ? "Getting started" : "Live"}
              />
              <MetricCard
                icon={<Briefcase className="h-4 w-4" />}
                label="Hiring load"
                value={openRoles}
                helper={`≈ ${openRolesPer100 || 0} roles / 100 people`}
                state={openRoles === 0 ? "No open roles" : "Actively hiring"}
              />
              <MetricCard
                icon={<CalendarClock className="h-4 w-4" />}
                label="Engagement"
                value={eventsTotal}
                helper={
                  employees > 0
                    ? `~${eventsPerEmployee || 0} events / employee`
                    : "Events logged in Intime"
                }
                state={eventsTotal === 0 ? "No events yet" : "In motion"}
              />
            </div>

            {/* Today / this week from events */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  This week in Intime
                </div>
                <span className="text-[11px] text-slate-500">
                  Last 7 days from your events stream
                </span>
              </div>

              {recent.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No events in the last 7 days. As you start logging hires, time
                  off, and changes, this panel shows where activity is picking
                  up.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    {recent.length} events captured · {typeEntries.length} types
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {typeEntries.slice(0, 6).map(([type, count]) => (
                      <span
                        key={type}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-700"
                      >
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        {type} · {count}
                      </span>
                    ))}
                    {typeEntries.length > 6 && (
                      <span className="text-[11px] text-slate-500">
                        +{typeEntries.length - 6} more types
                      </span>
                    )}
                  </div>
                  <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    Spikes in{" "}
                    <span className="font-medium text-slate-700">
                      time off, new hires, or performance events
                    </span>{" "}
                    will stand out here as your team uses Intime.
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Workspaces + AI + activity */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.6fr)]">
            {/* Left column: workspaces + AI card */}
            <div className="space-y-4">
              {/* Workspaces */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Workspaces
                </div>
                <div className="grid gap-2 text-xs">
                  <WorkspaceLink
                    href="/people"
                    title="People"
                    description="Directory, teams, reporting lines."
                    meta={`${employees} employees · ${teams} teams`}
                  />
                  <WorkspaceLink
                    href="/jobs"
                    title="Hiring"
                    description="Jobs, candidates, and AI Studio."
                    meta={`${openRoles} open roles`}
                  />
                  <WorkspaceLink
                    href="/timeoff"
                    title="Time off"
                    description="Policies, requests, and upcoming PTO."
                    meta="Time off policies"
                  />
                </div>
              </div>

              {/* AI Org Time Insights card */}
              <AiOrgTimeInsights
                employees={employees}
                openRoles={openRoles}
                eventsLast7Days={recent.length}
              />
            </div>

            {/* Right column: recent activity */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Recent activity
                </div>
                <span className="text-[11px] text-slate-500">
                  Pulled from your events timeline
                </span>
              </div>
              <EventsFeed />
            </div>
          </section>
        </main>
      </div>
    </AuthGate>
  );
}

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  helper: string;
  state: string;
};

function MetricCard({ icon, label, value, helper, state }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            {icon}
          </span>
          {label}
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {state}
        </span>
      </div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <p className="mt-1 text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}

type WorkspaceLinkProps = {
  href: string;
  title: string;
  description: string;
  meta?: string;
};

function WorkspaceLink({
  href,
  title,
  description,
  meta,
}: WorkspaceLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100"
    >
      <div>
        <div className="text-xs font-medium text-slate-900">{title}</div>
        <div className="text-[11px] text-slate-500">{description}</div>
        {meta && (
          <div className="mt-0.5 text-[11px] text-slate-400">{meta}</div>
        )}
      </div>
      <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-800">
        Open →
      </span>
    </Link>
  );
}

type AiOrgTimeInsightsProps = {
  employees: number;
  openRoles: number;
  eventsLast7Days: number;
};

function AiOrgTimeInsights({
  employees,
  openRoles,
  eventsLast7Days,
}: AiOrgTimeInsightsProps) {
  const hasActivity =
    (employees ?? 0) > 0 || (openRoles ?? 0) > 0 || (eventsLast7Days ?? 0) > 0;

  const headline = hasActivity
    ? "Early activity across your org"
    : "Quiet, pre-hiring phase";

  const summary = hasActivity
    ? "You’ve started to move. Intime highlights the next few actions so momentum doesn’t stall."
    : "Nothing is in motion yet. Use this calm period to design your first hiring and onboarding motion.";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-4 text-slate-50 shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-sky-400 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-1 text-[10px] font-medium">
            <Sparkles className="h-3 w-3" />
            AI org time insights
          </div>
          <h2 className="text-sm font-semibold">{headline}</h2>
          <p className="text-xs text-slate-200/90">{summary}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-200/80">
            <span className="rounded-full bg-slate-800/70 px-2 py-0.5">
              {employees} people
            </span>
            <span className="rounded-full bg-slate-800/70 px-2 py-0.5">
              {openRoles} open roles
            </span>
            <span className="rounded-full bg-slate-800/70 px-2 py-0.5">
              {eventsLast7Days} events this week
            </span>
          </div>
        </div>

        <div className="relative mt-2 w-full max-w-xs rounded-xl bg-slate-950/40 p-3 text-[11px] sm:mt-0">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              Suggested next steps
            </span>
          </div>
          <ul className="space-y-1.5">
            <InsightRow label="Define your first 3 roles." />
            <InsightRow label="Draft a simple onboarding checklist." />
            <InsightRow label="Decide on a basic PTO policy." />
          </ul>
        </div>
      </div>
    </section>
  );
}

type InsightRowProps = {
  label: string;
};

function InsightRow({ label }: InsightRowProps) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-slate-100">{label}</span>
      <button
        type="button"
        className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-50 hover:bg-slate-700"
      >
        Add as event
      </button>
    </li>
  );
}
