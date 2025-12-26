"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import Unauthorized from "@/components/unauthorized";
import { useAuth } from "@/context/auth";
import { getManagerHome } from "@/lib/manager-api";

type Task = {
  id: string;
  title?: string;
  dueDate?: string | null;
  priority?: string | null;
  actionUrl?: string | null;
};

type Kpis = {
  headcount?: number | null;
  overdueLearning?: number | null;
  pendingAttestations?: number | null;
  overdueReviews?: number | null;
};

type Report = {
  id?: string;
  name?: string;
  title?: string;
  department?: string;
  overdueLearning?: boolean;
  expiringCert?: boolean;
  overdueReview?: boolean;
};

type Action = { id?: string; label?: string; href?: string };

export default function ManagerHomeClient({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const { activeOrg } = useAuth();
  const role = (activeOrg?.role || "").toUpperCase();
  const allowed = role === "MANAGER" || role === "ADMIN" || role === "OWNER";

  const [data, setData] = useState<{
    tasks?: Task[];
    kpis?: Kpis;
    reports?: Report[];
    nextActions?: Action[];
    week?: any;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await getManagerHome(orgSlug);
        if (!cancelled) setData(res || {});
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load manager home");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const tasks = useMemo(() => (Array.isArray(data.tasks) ? data.tasks.slice(0, 5) : []), [data.tasks]);
  const reports = useMemo(() => (Array.isArray(data.reports) ? data.reports : []), [data.reports]);
  const kpis: Kpis = data.kpis || {};
  const actions = Array.isArray(data.nextActions) ? data.nextActions : [];

  if (!allowed) {
    return <Unauthorized roleLabel="managers and admins" fallbackHref={`/org/${orgSlug}/dashboard`} />;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Manager</p>
          <h1 className="text-2xl font-semibold text-slate-900">Manager Home</h1>
          <p className="text-sm text-slate-600">Your team’s priorities and signals for today.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{role}</div>
      </div>

      {error ? <SupportErrorCard title="Manager Home" message={error} requestId={requestId} /> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Today’s priorities</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/org/${orgSlug}/tasks`}>View inbox</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-600">Loading tasks…</p>
            ) : tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
                No open tasks. You’re all caught up.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <PriorityDot priority={task.priority} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{task.title || "Task"}</p>
                        <div className="text-xs text-slate-600">
                          {task.dueDate ? `Due ${task.dueDate}` : "No due date"}
                        </div>
                      </div>
                    </div>
                    {task.actionUrl ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (task.actionUrl?.startsWith("http")) {
                            window.location.href = task.actionUrl;
                          } else if (task.actionUrl) {
                            router.push(task.actionUrl);
                          }
                        }}
                      >
                        Open
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Next actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-slate-600">Loading…</p>
            ) : actions.length === 0 ? (
              <p className="text-sm text-slate-600">No suggested actions right now.</p>
            ) : (
              actions.map((action) => (
                <Button
                  key={action.id || action.label}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    if (action.href) {
                      if (action.href.startsWith("http")) {
                        window.location.href = action.href;
                      } else {
                        router.push(action.href);
                      }
                    }
                  }}
                >
                  {action.label || "Action"} <LayoutDashboard className="h-4 w-4 text-slate-500" />
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="Headcount"
          value={kpis.headcount}
          href={`/org/${orgSlug}/people`}
        />
        <KpiCard
          label="Overdue learning"
          value={kpis.overdueLearning}
          href={`/org/${orgSlug}/learning`}
        />
        <KpiCard
          label="Pending attestations"
          value={kpis.pendingAttestations}
          href={`/org/${orgSlug}/learning`}
        />
        <KpiCard
          label="Overdue reviews"
          value={kpis.overdueReviews}
          href={`/org/${orgSlug}/performance`}
        />
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Direct reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading…</p>
          ) : reports.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
              No direct reports yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r) => (
                    <tr key={r.id || r.name} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-sm text-slate-800">{r.name || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{r.title || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{r.department || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {r.overdueLearning ? <Flag label="Overdue learning" /> : null}
                          {r.expiringCert ? <Flag label="Expiring cert" /> : null}
                          {r.overdueReview ? <Flag label="Overdue review" /> : null}
                          {!r.overdueLearning && !r.expiringCert && !r.overdueReview ? "—" : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PriorityDot({ priority }: { priority?: string | null }) {
  const color =
    priority === "HIGH" ? "bg-rose-500" : priority === "MEDIUM" ? "bg-amber-500" : "bg-slate-300";
  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}

function KpiCard({ label, value, href }: { label: string; value?: number | null; href: string }) {
  const display = value == null ? "—" : value;
  return (
    <Link href={href}>
      <Card className="border-slate-200 hover:border-blue-200 hover:shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{display}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function Flag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
      {label}
    </span>
  );
}
