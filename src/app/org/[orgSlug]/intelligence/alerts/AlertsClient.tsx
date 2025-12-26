"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import { listAlerts, resolveAlert } from "@/lib/intelligence-api";
import { DecisionCreateDialog } from "@/components/intelligence/DecisionCreateDialog";

type Alert = {
  id: string;
  severity?: string;
  title?: string;
  createdAt?: string;
  owner?: string;
  status?: string;
  type?: string;
  description?: string;
  nextSteps?: string;
};

export default function AlertsClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowth = plan === "GROWTH" || plan === "SCALE";
  const isAdmin =
    (activeOrg?.role || "").toUpperCase() === "OWNER" ||
    (activeOrg?.role || "").toUpperCase() === "ADMIN";

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("open");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState<Alert | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listAlerts(orgSlug, {});
        if (!cancelled) setAlerts((Array.isArray(res) ? res : []) as Alert[]);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load alerts");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (isGrowth) void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, isGrowth]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchesStatus =
        filterStatus === "all" ? true : (a.status || "OPEN").toLowerCase() === filterStatus;
      const matchesSeverity = filterSeverity ? a.severity === filterSeverity : true;
      const matchesType = filterType ? a.type === filterType : true;
      return matchesStatus && matchesSeverity && matchesType;
    });
  }, [alerts, filterStatus, filterSeverity, filterType]);

  const resolve = async (id: string) => {
    try {
      await resolveAlert(orgSlug, id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a))
      );
    } catch {
      // ignore
    }
  };

  if (!isGrowth) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold text-amber-900">Upgrade to Growth</h2>
            <p className="mt-1 text-sm text-amber-800">
              Intelligence alerts are available on Growth and Scale.
            </p>
            <Button asChild className="mt-3 bg-amber-900 text-amber-50 hover:bg-amber-800">
              <a href={`/org/${orgSlug}/settings/billing`}>View plans</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">Intelligence</p>
        <h1 className="text-2xl font-semibold text-slate-900">Alerts</h1>
      </div>

      {error ? (
        <SupportErrorCard title="Alerts" message={error} requestId={requestId} />
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="all">All</option>
        </select>
        <select
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
        >
          <option value="">All severity</option>
          <option value="HIGH">High</option>
          <option value="MED">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="PAYROLL">Payroll</option>
          <option value="LEARNING">Learning</option>
          <option value="HIRING">Hiring</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading alerts…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
          No alerts to show.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Badge
                      className={
                        alert.severity === "HIGH"
                          ? "bg-rose-100 text-rose-800"
                          : alert.severity === "LOW"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-amber-100 text-amber-800"
                      }
                    >
                      {alert.severity || "MED"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-800">{alert.title || "Alert"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{alert.createdAt || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{alert.owner || "Unassigned"}</td>
                  <td className="px-3 py-2 text-xs text-indigo-600">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(alert)}>View</button>
                      {isAdmin && alert.status !== "RESOLVED" ? (
                        <button onClick={() => void resolve(alert.id)}>Resolve</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">{selected.title || "Alert"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span>Severity: {selected.severity || "MED"}</span>
              <span>Status: {selected.status || "OPEN"}</span>
              <span>Owner: {selected.owner || "Unassigned"}</span>
            </div>
            <p className="text-sm text-slate-700">{selected.description || "No details."}</p>
            {selected.nextSteps ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="text-xs uppercase tracking-wide text-slate-500">Recommended steps</p>
                <p>{selected.nextSteps}</p>
              </div>
            ) : null}
            <DecisionCreateDialog
              orgSlug={orgSlug}
              defaults={{
                title: selected.title,
                category: selected.type,
                sourceType: "ALERT",
                sourceId: selected.id,
              }}
            />
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
