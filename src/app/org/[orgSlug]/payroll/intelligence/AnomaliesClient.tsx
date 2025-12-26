"use client";

import { useEffect, useState } from "react";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";
import { listAnomalies, resolveAnomaly, runAnomalyScan } from "@/lib/payroll-api";

type Anomaly = {
  id?: string;
  type?: string;
  severity?: string;
  status?: string;
  message?: string;
  employee?: string;
  createdAt?: string;
};

export default function AnomaliesClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const role = (activeOrg?.role || "").toUpperCase();
  const isAdmin = role === "OWNER" || role === "ADMIN";
  const isScale = plan === "SCALE";
  const [filters, setFilters] = useState({ status: "OPEN", severity: "" });
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isScale) return;
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listAnomalies(orgSlug, {
          status: filters.status || undefined,
          severity: filters.severity || undefined,
        });
        if (!cancelled) setAnomalies(Array.isArray(res) ? res : []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load anomalies");
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
  }, [orgSlug, filters, isScale]);

  if (!isScale) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="font-semibold">Payroll intelligence is available on Scale.</div>
        <Button asChild size="sm" className="bg-amber-900 text-amber-50 hover:bg-amber-800">
          <a href={`/org/${orgSlug}/settings/billing`}>Upgrade to Scale</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
          <h1 className="text-2xl font-semibold text-slate-900">Anomalies</h1>
          <p className="text-sm text-slate-600">Detect and resolve payroll outliers.</p>
        </div>
        {isAdmin ? (
          <Button
            onClick={async () => {
              try {
                await runAnomalyScan(orgSlug);
                const res = await listAnomalies(orgSlug, {
                  status: filters.status || undefined,
                  severity: filters.severity || undefined,
                });
                setAnomalies(Array.isArray(res) ? res : []);
              } catch (err: any) {
                setError(err?.message || "Unable to run scan");
                setRequestId(err?.requestId || err?.response?.data?._requestId || null);
              }
            }}
          >
            Run scan
          </Button>
        ) : null}
      </div>

      {error ? <SupportErrorCard title="Anomalies" message={error} requestId={requestId} /> : null}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-700">
            <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Status</span>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
              <option value="">All</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Severity</span>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={filters.severity}
              onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
            >
              <option value="">All</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warn</option>
              <option value="ERROR">Error</option>
            </select>
          </label>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading…</p>
          ) : anomalies.length === 0 ? (
            <p className="text-sm text-slate-600">No anomalies found.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Employee</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Message</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anomalies.map((a) => (
                    <tr key={a.id || a.message} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-xs text-slate-700">{a.employee || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{a.type || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{a.severity || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{a.status || "OPEN"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{a.message || "—"}</td>
                      <td className="px-3 py-2 text-xs">
                        {a.status === "RESOLVED" ? (
                          <span className="text-slate-500">Resolved</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await resolveAnomaly(orgSlug, a.id || "");
                                setAnomalies((prev) =>
                                  prev.map((row) =>
                                    row.id === a.id ? { ...row, status: "RESOLVED" } : row
                                  )
                                );
                              } catch (err: any) {
                                setError(err?.message || "Unable to resolve");
                                setRequestId(err?.requestId || err?.response?.data?._requestId || null);
                              }
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeToScaleModal open={false} onClose={() => {}} orgSlug={orgSlug} />
    </div>
  );
}
