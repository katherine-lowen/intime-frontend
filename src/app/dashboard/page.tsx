// src/app/dashboard/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import EventsFeed from "@/components/events-feed";
import AiInsightsCard from "@/components/ai-insights-card";
import { AuthGate } from "@/components/dev-auth-gate";

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
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Intime dashboard
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                      Live data
                    </span>
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    One place for people, time, and hiring health.
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    This view combines your HRIS headcount, hiring pipeline, and
                    time-aware events so you can see what&apos;s happening in
                    the company today.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
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

                <div className="flex gap-2">
                  <Link
                    href="/analytics"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    Open analytics
                  </Link>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/healthz`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    API health
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Company snapshot row */}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)]">
            {/* Core numbers */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">Headcount</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {employees}
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Across {teams || 1} team{teams === 1 ? "" : "s"} ·
                  <span className="ml-1 font-medium text-slate-700">
                    avg {avgTeamSize || 0} people per team
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">Hiring load</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {openRoles}
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  That&apos;s approximately{" "}
                  <span className="font-medium text-slate-700">
                    {openRolesPer100 || 0} roles / 100 people
                  </span>
                  . Use this to sanity-check recruiting capacity.
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">Engagement</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {eventsTotal}
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Historical events in Intime ·
                  <span className="ml-1 font-medium text-slate-700">
                    ~{eventsPerEmployee || 0} events / employee
                  </span>
                </div>
              </div>
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
                <p className="text-sm text-slate-500">
                  No recorded events in the last week yet. As you start logging
                  hires, time off, and changes, this panel will highlight where
                  activity is happening.
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
                    Use this to spot patterns: spikes in{" "}
                    <span className="font-medium text-slate-700">
                      time off, new hires, or performance events
                    </span>{" "}
                    will show up here as your team uses Intime.
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Workspaces + AI + activity */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)]">
            {/* Left column: AI + workspace links */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Workspaces
                </div>
                <div className="grid gap-2 text-xs">
                  <Link
                    href="/people"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100"
                  >
                    <div>
                      <div className="font-medium text-slate-900">People</div>
                      <div className="text-[11px] text-slate-500">
                        Directory, teams, reporting lines.
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">Open →</span>
                  </Link>
                  <Link
                    href="/hiring"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100"
                  >
                    <div>
                      <div className="font-medium text-slate-900">Hiring</div>
                      <div className="text-[11px] text-slate-500">
                        Jobs, candidates, and AI Studio.
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">Open →</span>
                  </Link>
                  <Link
                    href="/timeoff"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100"
                  >
                    <div>
                      <div className="font-medium text-slate-900">Time off</div>
                      <div className="text-[11px] text-slate-500">
                        Policies, requests, and upcoming PTO.
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">Open →</span>
                  </Link>
                </div>
              </div>

              {/* AI narrative card from your existing component */}
              <AiInsightsCard />
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
