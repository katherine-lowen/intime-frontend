"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { listPayrollActions, getPayrollAction } from "@/lib/payroll-api";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";
import { useAuth } from "@/context/auth";

const STATUSES = ["QUEUED", "RUNNING", "COMPLETED", "FAILED"] as const;

export default function ActionsClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowth = plan === "GROWTH" || plan === "SCALE";
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isGrowth) return;
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listPayrollActions(orgSlug, status ? { status } : undefined);
        if (!cancelled) setActions(res || []);
      } catch (err: any) {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setError("Actions queue not enabled yet.");
          } else {
            setError(err?.message || "Unable to load actions");
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
  }, [orgSlug, status, isGrowth]);

  if (!isGrowth) {
    return (
      <div className="p-6">
        <UpgradeToScaleModal open={true} onClose={() => setShowUpgrade(false)} orgSlug={orgSlug} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
          <h1 className="text-2xl font-semibold text-slate-900">Provider actions</h1>
        </div>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={status || ""}
          onChange={(e) => setStatus(e.target.value || undefined)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error ? <SupportErrorCard title="Actions" message={error} requestId={requestId} /> : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : actions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No actions found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Attempts</th>
                <th className="px-3 py-2">Error</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actions.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-xs text-slate-600">{a.createdAt || "—"}</td>
                  <td className="px-3 py-2 text-sm text-slate-800">{a.employeeName || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{a.type || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{a.status || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{a.attempts ?? "—"}</td>
                  <td className="px-3 py-2 text-[11px] text-rose-700">{a.lastError || "—"}</td>
                  <td className="px-3 py-2 text-xs text-indigo-700">
                    <button
                      className="hover:underline"
                      onClick={async () => {
                        try {
                          const detail = await getPayrollAction(orgSlug, a.id);
                          setSelected(detail || a);
                        } catch (err: any) {
                          alert(err?.message || "Unable to load action");
                        }
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Action detail</h3>
                <p className="text-sm text-slate-600">{selected.type || "Action"}</p>
              </div>
              <button
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div>Status: {selected.status || "—"}</div>
              <div>Attempts: {selected.attempts ?? "—"}</div>
              <div>Created: {selected.createdAt || "—"}</div>
              <div>Last error: {selected.lastError || "—"}</div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-900">Payload</p>
              <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-slate-950/90 p-3 text-xs text-slate-100">
                {JSON.stringify(selected.payload || selected, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
