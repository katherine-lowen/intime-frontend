"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { getQboDiff } from "@/lib/payroll-reconcile-api";

export default function DiffClient({ orgSlug, employeeId }: { orgSlug: string; employeeId: string }) {
  const [diff, setDiff] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await getQboDiff(orgSlug, employeeId);
        if (!cancelled) setDiff(res || null);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load diff");
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
  }, [orgSlug, employeeId]);

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading…</div>;
  if (error) return <SupportErrorCard title="Diff" message={error} requestId={requestId} />;
  if (!diff) return <div className="p-6 text-sm text-slate-600">No diff found.</div>;

  const fields = diff.fields || [];

  return (
    <div className="space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
        <h1 className="text-2xl font-semibold text-slate-900">Comp mismatch</h1>
        <p className="text-sm text-slate-600">{diff.employeeName || employeeId}</p>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
        {fields.length === 0 ? (
          <p className="text-sm text-slate-600">No mismatched fields.</p>
        ) : (
          fields.map((f: any, idx: number) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{f.field || "Field"}</p>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  Mismatch
                </span>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Intime</p>
                  <p className="text-sm text-slate-900">{f.intime ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">QuickBooks</p>
                  <p className="text-sm text-slate-900">{f.qbo ?? "—"}</p>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm">
                  Update in Intime
                </Button>
                <Button variant="outline" size="sm">
                  Update in QuickBooks
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
