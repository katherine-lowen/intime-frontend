"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";
import { useAuth } from "@/context/auth";
import { listAlerts, runAlerts } from "@/lib/payroll-reports-api";

const FILTERS = ["OPEN", "RESOLVED"] as const;

export default function AlertsClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isScale = plan === "SCALE";
  const [status, setStatus] = useState<string>("OPEN");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(!isScale);

  useEffect(() => {
    if (!isScale) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listAlerts(orgSlug, { status });
        if (!cancelled) setAlerts(res || []);
      } catch (err: any) {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setError("Alerts not enabled yet.");
          } else {
            setError(err?.message || "Unable to load alerts");
            setRequestId(err?.requestId || err?.response?.data?._requestId || null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, status, isScale]);

  if (!isScale) {
    return (
      <div className="p-6">
        <UpgradeToScaleModal open={showUpgrade} onClose={() => setShowUpgrade(false)} orgSlug={orgSlug} />
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Alerts are on Scale.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
          <h1 className="text-2xl font-semibold text-slate-900">Alerts</h1>
        </div>
        <Button
          onClick={async () => {
            try {
              await runAlerts(orgSlug);
              const res = await listAlerts(orgSlug, { status });
              setAlerts(res || []);
            } catch (err: any) {
              alert(err?.message || "Unable to run alerts");
            }
          }}
        >
          Run alerts now
        </Button>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              status === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
            }`}
            onClick={() => setStatus(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error ? <SupportErrorCard title="Alerts" message={error} requestId={requestId} /> : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No alerts.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        a.severity === "ERROR"
                          ? "bg-rose-50 text-rose-700"
                          : a.severity === "WARN"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {a.severity || "INFO"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-800">{a.title || "Alert"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{a.createdAt || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{a.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
