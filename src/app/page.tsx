// src/app/page.tsx
import Link from "next/link";

// Pull org-wide stats from backend
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
    // fallback demo numbers if API unavailable
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

  const quickActions = [
    { label: "Add Event", href: "/add-event" },
    { label: "Invite Employee", href: "/teams" },
    { label: "Create Job", href: "/jobs" },
    { label: "View Analytics", href: "/analytics" },
  ];

  const highlights = [
    {
      title: "Org Health",
      details: [
        `Headcount: ${data.employees ?? 34}`,
        `Teams Active: ${data.teams ?? 8}`,
        `Roles Open: ${data.openRoles ?? 12}`,
      ],
    },
    {
      title: "Next Actions",
      details: [
        "Add new hire events",
        "Review open roles",
        "Invite your managers",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <h1 className="text-3xl font-semibold tracking-tight">
        Intime Overview
      </h1>
      <p className="mt-2 text-neutral-600">
        Your organization’s live pulse — people, teams, and time data unified.
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="text-sm text-neutral-600">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center text-sm font-medium hover:bg-neutral-100 transition"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {highlights.map((h) => (
          <div
            key={h.title}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-3">{h.title}</h3>
            <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
              {h.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}