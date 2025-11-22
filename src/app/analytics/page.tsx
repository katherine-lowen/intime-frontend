// src/app/analytics/page.tsx  (or src/app/page.tsx if this is your main dashboard)
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import {
  Users,
  Group,
  Briefcase,
  Activity,
  ArrowUpRight,
  ArrowRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

type OrgStats = {
  employees: number;
  teams: number;
  openRoles: number;
  eventsLogged: number;
  newEvents24h: number;
  activeTeams: number;
};

type EventItem = {
  id: string;
  type: string;
  source?: string | null;
  summary?: string | null;
  createdAt?: string;
};

async function getOrgStats(): Promise<OrgStats> {
  return api.get<OrgStats>("/analytics/stats");
}

async function getRecentEvents(): Promise<EventItem[]> {
  // adjust limit if your backend uses a different param
  return api.get<EventItem[]>("/events?limit=5");
}

function formatTime(ts?: string) {
  if (!ts) return "Unknown time";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "Unknown time";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AnalyticsPage() {
  const [stats, events] = await Promise.all([getOrgStats(), getRecentEvents()]);

  return (
    <AuthGate>
      <main className="px-8 py-8 space-y-8">
        {/* TOP HERO */}
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-50 to-indigo-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live analytics
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Organization <span className="text-indigo-600">Analytics</span>
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Unified metrics across people, teams, roles, and time-aware
                events—powered by the Intime API.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/events"
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              View events
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/analytics/stats"
              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              Raw /stats
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* METRIC CARDS */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Employees</p>
              <span className="rounded-full bg-indigo-50 p-1">
                <Users className="h-4 w-4 text-indigo-600" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {stats.employees}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Synced via Intime HR API.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Teams</p>
              <span className="rounded-full bg-indigo-50 p-1">
                <Group className="h-4 w-4 text-indigo-600" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {stats.teams}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {stats.activeTeams} active in the last 30 days.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Open roles</p>
              <span className="rounded-full bg-indigo-50 p-1">
                <Briefcase className="h-4 w-4 text-indigo-600" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {stats.openRoles}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Pulled from Jobs & ATS.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Events logged
              </p>
              <span className="rounded-full bg-indigo-50 p-1">
                <Activity className="h-4 w-4 text-indigo-600" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {stats.eventsLogged}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {stats.newEvents24h} new in the last 24h.
            </p>
          </div>
        </section>

        {/* LOWER GRID: EVENTS + HIGHLIGHTS */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Recent events */}
          <div className="lg:col-span-2 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Recent events
              </h2>
              <Link
                href="/events"
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                View all events
              </Link>
            </div>

            {events.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                No recent events yet. Connect your HR, ATS, and calendar
                systems to start streaming activity into Intime.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3 py-3">
                    <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-indigo-50 text-xs font-medium text-indigo-700 flex items-center justify-center">
                      {ev.type?.[0] ?? "E"}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-medium text-slate-900">
                        {ev.summary || ev.type}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {ev.source ? `${ev.source} • ` : ""}
                        {formatTime(ev.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-end border-t border-slate-100 pt-3">
              <Link
                href="/events?sort=newest"
                className="text-[11px] text-slate-500 hover:text-slate-700"
              >
                Newest first · {events.length} shown
              </Link>
            </div>
          </div>

          {/* Highlights / Next steps */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Org pulse
                </h2>
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-700">
                <li>
                  <span className="font-medium">{stats.newEvents24h}</span> new
                  events (24h)
                </li>
                <li>
                  <span className="font-medium">{stats.eventsLogged}</span>{" "}
                  total tracked events
                </li>
                <li>
                  <span className="font-medium">{stats.activeTeams}</span> teams
                  active this month
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Next steps
              </h2>
              <ul className="mt-3 space-y-2 text-xs text-slate-700">
                <li>
                  Add activity via{" "}
                  <Link href="/events/new" className="text-indigo-600">
                    Add Event
                  </Link>
                  .
                </li>
                <li>
                  Invite teammates in{" "}
                  <Link href="/teams" className="text-indigo-600">
                    Teams
                  </Link>
                  .
                </li>
                <li>
                  Configure hiring in{" "}
                  <Link href="/jobs" className="text-indigo-600">
                    Jobs
                  </Link>
                  .
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600">
              <p className="mb-1 font-medium text-slate-800">
                API health & debug
              </p>
              <p>
                Check your ingest pipeline and stats endpoints from the{" "}
                <Link href="/health" className="text-indigo-600">
                  API Health
                </Link>{" "}
                panel.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
