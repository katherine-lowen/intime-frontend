"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";
import {
  getQboHealth,
  runQboReconcile,
  listQboIssues,
  resolveQboIssue,
} from "@/lib/payroll-reconcile-api";
import Link from "next/link";

const TYPES = [
  "MISSING_IN_QB",
  "MISSING_IN_INTIME",
  "EMAIL_MISSING",
  "DUPLICATE_EMAIL",
  "COMP_MISMATCH",
  "STALE_SYNC",
];

const STATUSES = ["OPEN", "RESOLVED"];
const SEVERITIES = ["INFO", "WARN", "ERROR"];

export default function ReconciliationClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowth = plan === "GROWTH" || plan === "SCALE";

  const [health, setHealth] = useState<any | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [type, setType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [severity, setSeverity] = useState<string | undefined>(undefined);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const badge =
    health?.status === "OK"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : health?.status === "ERROR"
        ? "bg-rose-50 text-rose-700 border-rose-100"
        : "bg-amber-50 text-amber-700 border-amber-100";

  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      if (type && i.type !== type) return false;
      if (status && i.status !== status) return false;
      if (severity && (i.severity || i.level) !== severity) return false;
      return true;
    });
  }, [issues, type, status, severity]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const [h, list] = await Promise.all([
          getQboHealth(orgSlug),
          listQboIssues(orgSlug),
        ]);
        if (!cancelled) {
          setHealth(h || null);
          setIssues(list || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setError("Reconciliation not enabled yet.");
          } else {
            setError(err?.message || "Unable to load reconciliation");
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
  }, [orgSlug]);

  const run = async () => {
    if (!isGrowth) {
      setShowUpgrade(true);
      return;
    }
    setRunning(true);
    try {
      const res = await runQboReconcile(orgSlug);
      alert(res?.summary || "Reconciliation started");
      const list = await listQboIssues(orgSlug);
      setIssues(list || []);
    } catch (err: any) {
      alert(err?.message || "Unable to run reconciliation");
    } finally {
      setRunning(false);
    }
  };

  const markResolved = async (id: string) => {
    if (!isGrowth) {
      setShowUpgrade(true);
      return;
    }
    try {
      await resolveQboIssue(orgSlug, id);
      const list = await listQboIssues(orgSlug);
      setIssues(list || []);
    } catch (err: any) {
      alert(err?.message || "Unable to resolve");
    }
  };

  if (!isGrowth) {
    return (
      <div className="p-6">
        <UpgradeCard orgSlug={orgSlug} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
          <h1 className="text-2xl font-semibold text-slate-900">Reconciliation</h1>
          <p className="text-sm text-slate-600">Keep Intime and QuickBooks in sync.</p>
        </div>
        <Button onClick={() => void run()} disabled={running}>
          {running ? "Running…" : "Run reconciliation"}
        </Button>
      </div>

      {error ? <SupportErrorCard title="Reconciliation" message={error} requestId={requestId} /> : null}

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Health</h2>
            <p className="text-xs text-slate-600">
              {health?.connected ? "Connected" : "Not connected"} · Last sync: {health?.lastSync || "—"}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}>
            {health?.status || "Needs attention"}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Metric label="Mapped" value={health?.mappedCount ?? "—"} />
          <Metric label="Open issues" value={health?.openIssues ?? "—"} />
          <Metric label="Last payroll" value={health?.lastPayroll || "—"} />
          <Metric label="Next payroll" value={health?.nextPayroll || "—"} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={type || ""}
            onChange={(e) => setType(e.target.value || undefined)}
          >
            <option value="">Type</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={status || ""}
            onChange={(e) => setStatus(e.target.value || undefined)}
          >
            <option value="">Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={severity || ""}
            onChange={(e) => setSeverity(e.target.value || undefined)}
          >
            <option value="">Severity</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
            No issues found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Message</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 text-sm text-slate-800">{issue.type || "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          (issue.severity || issue.level) === "ERROR"
                            ? "bg-rose-50 text-rose-700"
                            : (issue.severity || issue.level) === "WARN"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {issue.severity || issue.level || "INFO"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-800">
                      {issue.employeeName || issue.providerEmployee || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{issue.email || "—"}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{issue.message || issue.detail || "—"}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 space-x-2">
                      {issue.type === "COMP_MISMATCH" ? (
                        <Link
                          className="text-indigo-700 hover:underline"
                          href={`/org/${orgSlug}/payroll/reconciliation/${issue.employeeId || issue.employee || ""}`}
                        >
                          View diff
                        </Link>
                      ) : null}
                      {issue.status !== "RESOLVED" ? (
                        <button
                          className="text-indigo-700 hover:underline"
                          onClick={() => void markResolved(issue.id)}
                        >
                          Mark resolved
                        </button>
                      ) : (
                        <span className="text-slate-500">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <UpgradeToScaleModal open={showUpgrade} onClose={() => setShowUpgrade(false)} orgSlug={orgSlug} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function UpgradeCard({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="font-semibold">Reconciliation is available on Growth.</div>
      <div className="mt-1">Upgrade in billing to unlock this feature.</div>
      <Button
        asChild
        size="sm"
        className="mt-2 bg-amber-900 text-amber-50 hover:bg-amber-800"
      >
        <a href={`/org/${orgSlug}/settings/billing`}>Go to billing</a>
      </Button>
    </div>
  );
}
