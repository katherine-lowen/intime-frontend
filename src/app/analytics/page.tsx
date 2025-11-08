// src/app/analytics/page.tsx
import { RecentEventsTable } from "@/components/recent-events";

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

async function fetchStats(): Promise<{
  employees: number;
  teams: number;
  events: number;
  openRoles: number;
}> {
  const data = await fetchJSON<StatsResponse>("/stats");

  if (!data) return { employees: 0, teams: 0, events: 0, openRoles: 0 };

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
  // newest first & cap
  return data
    .slice()
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, limit);
}

export default async function AnalyticsPage() {
  const [stats, events] = await Promise.all([fetchStats(), fetchRecentEvents()]);

  const kpis = [
    { label: "Employees", value: stats.employees },
    { label: "Teams", value: stats.teams },
    { label: "Open Roles", value: stats.openRoles },
    { label: "Events Logged", value: stats.events },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Unified metrics across people, teams, and time-aware events.
          </p>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_API_URL + "/stats"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 underline"
        >
          View raw /stats API
        </a>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="text-sm text-neutral-600">{k.label}</div>
            <div className="mt-1 text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Activity snapshot */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Recent Events</h2>
          <RecentEventsTable events={events} />
        </div>

        <div className="lg:col-span-1">
          <h2 className="mb-3 text-lg font-semibold">Highlights</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-600">Org Pulse</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700">
                <li>New events in last 24h: <strong>{Math.min(12, events.length)}</strong></li>
                <li>Total tracked events: <strong>{stats.events}</strong></li>
                <li>Teams active: <strong>{stats.teams}</strong></li>
              </ul>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-600">Next Steps</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700">
                <li>
                  Add more events via the{" "}
                  <a
                    href="/add-event"
                    className="text-indigo-600 underline"
                  >
                    Add Event
                  </a>{" "}
                  form.
                </li>
                <li>
                  Invite teammates on{" "}
                  <a href="/teams" className="text-indigo-600 underline">
                    Teams
                  </a>
                  .
                </li>
                <li>
                  Create roles in{" "}
                  <a href="/jobs" className="text-indigo-600 underline">
                    Jobs
                  </a>
                  .
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
