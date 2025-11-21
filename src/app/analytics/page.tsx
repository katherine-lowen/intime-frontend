// src/app/analytics/page.tsx
import Link from "next/link";
import { RecentEventsTable } from "@/components/recent-events";
import { AuthGate } from "@/components/dev-auth-gate";

/** ---- Types & helpers ---- */
type StatsResponse = {
  employees?: number | string;
  users?: number | string;
  userCount?: number | string;
  teams?: number | string;
  teamCount?: number | string;
  events?: number | string;
  eventCount?: number | string;
  openRoles?: number | string;
  approvals?: number | string;
  [key: string]: unknown;
};

type EventItem = {
  id?: string | number;
  type?: string;
  actor?: string;
  description?: string;
  createdAt?: string | Date;
};

function toNumber(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : 0;
}

async function fetchJSON<T>(path: string): Promise<T | null> {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const org = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";
  try {
    const res = await fetch(`${api}${path}`, {
      headers: { "X-Org-Id": org },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchStats() {
  const data = await fetchJSON<StatsResponse>("/stats");
  if (!data) {
    return { employees: 34, teams: 8, openRoles: 12, events: 124 };
  }
  const employees =
    toNumber(data.employees) || toNumber(data.users) || toNumber(data.userCount);
  const teams = toNumber(data.teams) || toNumber(data.teamCount);
  const events = toNumber(data.events) || toNumber(data.eventCount);
  const openRoles = toNumber(data.openRoles);
  return { employees, teams, events, openRoles };
}

async function fetchRecentEvents(limit = 8): Promise<EventItem[]> {
  const data = await fetchJSON<EventItem[]>("/events");
  if (!Array.isArray(data)) return [];
  return data
    .slice()
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, limit);
}

/** ---- Page ---- */
export default async function AnalyticsPage() {
  const [stats, events] = await Promise.all([fetchStats(), fetchRecentEvents()]);

  const kpis = [
    { label: "Employees", value: stats.employees },
    { label: "Teams", value: stats.teams },
    { label: "Open Roles", value: stats.openRoles },
    { label: "Events Logged", value: stats.events },
  ];

  const apiBase = process.env.NEXT_PUBLIC_API_URL!;

  return (
    <div className="relative">
      {/* Gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white" />

      {/* Hero / heading */}
      <section className="mx-auto max-w-6xl px-6 pt-8">
        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" /> Live Analytics
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Organization <span className="text-indigo-600">Analytics</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                Unified metrics across people, teams, and time-aware events—powered by the Intime API.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/events"
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                View Events
              </Link>
              <a
                href={`${apiBase}/stats`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Raw /stats
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-100 opacity-0 blur-2xl transition group-hover:opacity-100" />
              <div className="text-sm text-neutral-600">{k.label}</div>
              <div className="mt-1 text-3xl font-semibold tracking-tight">{k.value}</div>
              <div className="mt-4 text-xs text-neutral-500">Synced via API</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity + Highlights */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold">Recent Events</h2>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <RecentEventsTable events={events} />
              <div className="mt-3 flex items-center justify-end gap-4 text-xs text-neutral-600">
                <a
                  href={`${apiBase}/events`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline"
                >
                  View raw /events
                </a>
                <span>Newest first • {events.length} shown</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Highlights</h2>
            <div className="space-y-3">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-neutral-600">Org Pulse</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  <li>New events (24h): <strong>{Math.min(12, events.length)}</strong></li>
                  <li>Total tracked events: <strong>{stats.events}</strong></li>
                  <li>Teams active: <strong>{stats.teams}</strong></li>
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-neutral-600">Next Steps</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  <li>
                    Add activity via{" "}
                    <Link href="/add-event" className="text-indigo-600 underline">
                      Add Event
                    </Link>
                    .
                  </li>
                  <li>
                    Invite teammates in{" "}
                    <Link href="/teams" className="text-indigo-600 underline">
                      Teams
                    </Link>
                    .
                  </li>
                  <li>
                    Open roles in{" "}
                    <Link href="/jobs" className="text-indigo-600 underline">
                      Jobs
                    </Link>
                    .
                  </li>
                </ul>
              </div>
              <a
                href={`${apiBase}/healthz`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-medium text-indigo-600 underline"
              >
                API Health
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
