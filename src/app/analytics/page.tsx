// src/app/analytics/page.tsx

// Accept multiple possible shapes from /stats
type Stats =
  Partial<
    Record<
      | "users"
      | "employees"
      | "teams"
      | "openRoles"
      | "approvals"
      | "events"
      | "userCount"
      | "teamCount"
      | "eventCount",
      number | string
    >
  > &
    Record<string, unknown>;

function toNum(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : 0;
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
    const data: Stats = await res.json();

    // Map common field names to the three numbers we show
    const employees = toNum(
      data.employees ?? data.users ?? data.userCount ?? 0
    );
    const teams = toNum(data.teams ?? data.teamCount ?? 0);
    const events = toNum(data.events ?? data.eventCount ?? 0);

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
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="mt-2 text-neutral-600">
        Key metrics across your organization.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600">{c.label}</div>
            <div className="mt-1 text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
