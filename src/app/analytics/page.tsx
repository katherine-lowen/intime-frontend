// src/app/analytics/page.tsx

type StatsResponse = {
  employees?: number;
  users?: number;
  teams?: number;
  openRoles?: number;
  approvals?: number;
  events?: number;
  userCount?: number;
  teamCount?: number;
  eventCount?: number;
  [key: string]: unknown;
};

function toNumber(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : 0;
}

async function fetchStats(): Promise<{
  employees: number;
  teams: number;
  events: number;
}> {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const org = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

  try {
    const res = await fetch(`${api}/stats`, {
      headers: { "X-Org-Id": org },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: StatsResponse = await res.json();

    const employees =
      toNumber(data.employees) ||
      toNumber(data.users) ||
      toNumber(data.userCount);
    const teams = toNumber(data.teams) || toNumber(data.teamCount);
    const events = toNumber(data.events) || toNumber(data.eventCount);

    return { employees, teams, events };
  } catch {
    return { employees: 0, teams: 0, events: 0 };
  }
}

export default async function AnalyticsPage() {
  const { employees, teams, events } = await fetchStats();

  const cards = [
    { label: "Employees", value: employees },
    { label: "Teams", value: teams },
    { label: "Events", value: events },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Analytics • Live</h1>
      <p className="mt-2 text-neutral-600">
        Key metrics across your organization.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-neutral-200 p-4 shadow-sm"
          >
            <div className="text-sm text-neutral-600">{c.label}</div>
            <div className="mt-1 text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
