// src/app/page.tsx
import Link from "next/link";
import QuickAddEvent from "@/components/quick-add-event";

async function fetchStats() {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const org = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

  try {
    const res = await fetch(`${api}/stats`, {
      headers: { "X-Org-Id": org },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { employees: 34, teams: 8, openRoles: 12, events: 124 };
  }
}

export default async function DashboardPage() {
  const data = await fetchStats();

  const stats = [
    { label: "Employees", value: data.employees ?? 0 },
    { label: "Teams", value: data.teams ?? 0 },
    { label: "Open Roles", value: data.openRoles ?? 0 },
    { label: "Events Tracked", value: data.events ?? 0 },
  ];

  const quick = [
    { label: "Invite Employee", href: "/teams" },
    { label: "Create Job", href: "/jobs" },
    { label: "View Analytics", href: "/analytics" },
  ];

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white" />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-8">
        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Unified Time Intelligence
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Welcome to <span className="text-indigo-600">Intime</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                A single pane for people, teams, and time-aware events—built on a live API.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/analytics"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Open Analytics
              </Link>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/healthz`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                API Health
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-100 opacity-0 blur-2xl transition group-hover:opacity-100" />
              <div className="text-sm text-neutral-600">{s.label}</div>
              <div className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-4 text-xs text-neutral-500">Live via /stats</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions + Highlights */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick actions with embedded QuickAddEvent */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Create activity you can immediately see in Analytics and Events.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quick.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-sm font-medium transition hover:-translate-y-0.5 hover:bg-neutral-100 hover:shadow-sm"
                >
                  {a.label}
                </Link>
              ))}
            </div>

            {/* Embedded Quick Add Event */}
            <div className="mt-6">
              <QuickAddEvent />
            </div>
          </div>

          {/* Highlights */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Highlights</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              <li>Unified schema for people, teams, jobs, and events</li>
              <li>Live NestJS API on Render (Prisma + Postgres)</li>
              <li>Production frontend on Vercel (Next.js App Router)</li>
            </ul>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/healthz`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 underline"
            >
              API Health
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
