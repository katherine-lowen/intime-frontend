"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";
import { useAuth } from "@/context/auth";
import { getChanges, getForecast, getImpact, listAlerts } from "@/lib/payroll-reports-api";

const GROUPS = ["NONE", "DEPARTMENT", "TEAM", "LOCATION"] as const;

export default function ReportsClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isScale = plan === "SCALE";

  const [range, setRange] = useState({ from: "", to: "" });
  const [groupBy, setGroupBy] = useState<string>("NONE");
  const [impact, setImpact] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [changes, setChanges] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(!isScale);

  useEffect(() => {
    if (!isScale) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const [imp, fore, chg, al] = await Promise.all([
          getImpact(orgSlug, { ...range, groupBy: groupBy === "NONE" ? undefined : groupBy }),
          getForecast(orgSlug, { periods: 3 }),
          getChanges(orgSlug, { status: "APPROVED" }),
          listAlerts(orgSlug, { status: "OPEN" }),
        ]);
        if (!cancelled) {
          setImpact(imp || null);
          setForecast(fore || null);
          setChanges(Array.isArray(chg) ? chg : []);
          setAlerts(Array.isArray(al) ? al : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load payroll reports");
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
  }, [orgSlug, groupBy, range.from, range.to, isScale]);

  if (!isScale) {
    return (
      <div className="p-6">
        <UpgradeToScaleModal open={showUpgrade} onClose={() => setShowUpgrade(false)} orgSlug={orgSlug} />
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Payroll insights are on Scale.</p>
          <p className="text-sm text-slate-600">Upgrade to see payroll impact, forecasts, and alerts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
          <h1 className="text-2xl font-semibold text-slate-900">Payroll reports</h1>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
          />
          <input
            type="date"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                Group by {g === "NONE" ? "none" : g.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <SupportErrorCard title="Reports" message={error} requestId={requestId} /> : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Last payroll" value={impact?.lastPayrollGross ? `$${impact.lastPayrollGross}` : "—"} helper={impact?.lastPayrollDate} />
            <Metric
              label="Next payroll projection"
              value={impact?.nextPayrollGross ? `$${impact.nextPayrollGross}` : "—"}
              helper={impact?.nextPayrollDelta ? `${impact.nextPayrollDelta}%` : ""}
            />
            <Metric label="Forecast" value={forecast?.total ? `$${forecast.total}` : "—"} helper="Next 3 runs" />
            <Metric label="Open alerts" value={alerts.length} helper="View alerts below" />
          </div>

          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Breakdown</h2>
            {impact?.breakdown?.length ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Group</th>
                      <th className="px-3 py-2">Headcount</th>
                      <th className="px-3 py-2">Projected gross</th>
                      <th className="px-3 py-2">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {impact.breakdown.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2 text-sm text-slate-800">{row.group || "—"}</td>
                        <td className="px-3 py-2 text-sm text-slate-800">{row.headcount ?? "—"}</td>
                        <td className="px-3 py-2 text-sm text-slate-800">
                          {row.projectedGross ? `$${row.projectedGross}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-800">
                          {row.deltaPct ? `${row.deltaPct}%` : row.delta ? `$${row.delta}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No breakdown data.</p>
            )}
          </section>

          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Upcoming changes</h2>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                onChange={(e) => {
                  const val = e.target.value;
                  setChanges((prev) => prev); // placeholder to keep UI responsive
                }}
              >
                <option value="ALL">All</option>
                <option value="APPROVED">Approved</option>
                <option value="APPLIED">Applied</option>
              </select>
            </div>
            {changes.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No upcoming changes.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {changes.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.employeeName || "Employee"}</p>
                      <p className="text-xs text-slate-500">
                        Effective {c.effectiveDate || "—"} · {c.estimatedImpact ? `Impact: $${c.estimatedImpact}` : "Impact unknown"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      {c.status || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
