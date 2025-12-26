"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";

type PayrollSummary = {
  connected?: boolean;
  lastRun?: string | null;
  nextRun?: string | null;
  totalCost?: number | null;
  status?: string | null;
};

export default function PayrollPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
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
        const res = await api.get<PayrollSummary>("/payroll/quickbooks/status");
        if (!cancelled) setSummary(res || null);
      } catch (err: any) {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setSummary({ connected: false });
          } else {
            setError(err?.message || "Unable to load payroll status");
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
  }, []);

  if (!orgSlug) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        Organization not found.
      </div>
    );
  }

  const connected = summary?.connected;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
          <h1 className="text-2xl font-semibold text-slate-900">QuickBooks Payroll</h1>
          <p className="text-sm text-slate-600">
            Connect QuickBooks to view payroll data inside Intime. Read-only for now.
          </p>
        </div>
        <div className="flex gap-2">
          {connected ? (
            <Button variant="outline" asChild>
              <Link href="/org">Manage connection</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/payroll/quickbooks/oauth">Connect QuickBooks Payroll</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/payroll/comp-changes`}>
              Comp changes
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/payroll/reconciliation`}>
              Reconciliation
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/payroll/actions`}>
              Actions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/payroll/reports`}>
              Reports
            </Link>
          </Button>
        </div>
      </div>

      {error ? (
        <SupportErrorCard title="Payroll" message={error} requestId={requestId} />
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Connection" value={connected ? "Connected" : "Not connected"} />
          <Metric label="Last payroll run" value={summary?.lastRun || "—"} />
          <Metric label="Next payroll date" value={summary?.nextRun || "—"} />
          <Metric
            label="Total payroll cost"
            value={
              typeof summary?.totalCost === "number"
                ? `$${summary.totalCost.toLocaleString()}`
                : "—"
            }
          />
        </div>
      )}

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Connection status</h2>
        <p className="mt-1 text-sm text-slate-600">
          {connected
            ? "QuickBooks Payroll is connected. Data refreshes automatically."
            : "Not connected. Connect to view payroll runs and totals."}
        </p>
        {!connected ? (
          <Button asChild className="mt-3">
            <Link href="/payroll/quickbooks/oauth">Connect QuickBooks Payroll</Link>
          </Button>
        ) : null}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
