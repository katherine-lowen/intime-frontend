// src/app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentEventsTable } from "@/components/recent-events";
import { get } from "@/lib/api";

type Stats = { employees: number; openRoles: number; approvals: number };

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const stats =
    (await get<Stats>("/stats").catch(() => ({
      employees: 42,
      openRoles: 7,
      approvals: 5,
    }))) as Stats;

  const tiles = [
    { label: "Active Employees", value: stats.employees, cta: { text: "Manage", href: "/employees" } },
    { label: "Open Roles", value: stats.openRoles, cta: { text: "Create Job", href: "/jobs" } },
    { label: "Pending Approvals", value: stats.approvals, cta: { text: "Review", href: "/settings" } },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label} className="shadow-card">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-sm text-neutral-600">{t.label}</div>
                <div className="mt-1 text-4xl font-semibold">{t.value}</div>
              </div>
              <a
                href={t.cta.href}
                className="rounded-full bg-brand px-4 py-2 text-white shadow-sm hover:opacity-90"
              >
                {t.cta.text}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-card">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <p className="mt-1 text-sm text-neutral-600">Latest HR & recruiting events</p>
          </div>
          <a href="/analytics" className="rounded-full border px-4 py-2 text-sm">
            Open Dashboard
          </a>
        </CardHeader>
        <CardContent className="p-0">
          <RecentEventsTable />
        </CardContent>
      </Card>
    </div>
  );
}
