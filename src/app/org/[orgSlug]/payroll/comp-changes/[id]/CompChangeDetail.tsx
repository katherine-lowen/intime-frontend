"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import {
  decideCompChange,
  applyCompChange,
  getCompChange,
  exportCompChange,
  listPayBands,
} from "@/lib/payroll-api";
import { useAuth } from "@/context/auth";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";

export default function CompChangeDetail({
  orgSlug,
  changeId,
}: {
  orgSlug: string;
  changeId: string;
}) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const canManage = plan === "GROWTH" || plan === "SCALE";
  const [change, setChange] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [exportData, setExportData] = useState<any | null>(null);
  const [bands, setBands] = useState<any[]>([]);
  const [outOfBand, setOutOfBand] = useState(false);
  const [bandMatch, setBandMatch] = useState<any | null>(null);
  const [overrideChecked, setOverrideChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await getCompChange(orgSlug, changeId);
        if (!cancelled) setChange(res || null);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load change");
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
  }, [orgSlug, changeId]);

  useEffect(() => {
    let cancelled = false;
    async function loadBands() {
      try {
        const res = await listPayBands(orgSlug);
        if (!cancelled) setBands(Array.isArray(res) ? res : []);
      } catch {
        // ignore if not available
      }
    }
    if (change) void loadBands();
    return () => {
      cancelled = true;
    };
  }, [change, orgSlug]);

  useEffect(() => {
    setOverrideChecked(false);
    if (!change || !bands.length) {
      setOutOfBand(false);
      setBandMatch(null);
      return;
    }
    const amount =
      Number(change.amount) ||
      Number(change.newAmount) ||
      Number(change.targetAmount) ||
      Number(change.comp) ||
      0;
    if (!amount) {
      setOutOfBand(false);
      setBandMatch(null);
      return;
    }
    const match = bands.find((b) => {
      const roleMatch =
        (b.role && change.role && b.role.toLowerCase() === String(change.role).toLowerCase()) ||
        (b.role && change.jobTitle && b.role.toLowerCase() === String(change.jobTitle).toLowerCase());
      const levelMatch =
        b.level &&
        change.level &&
        String(b.level).toLowerCase() === String(change.level).toLowerCase();
      return roleMatch || levelMatch || (!b.role && !b.level);
    });
    setBandMatch(match || null);
    if (match) {
      const below = match.min != null && amount < Number(match.min);
      const above = match.max != null && amount > Number(match.max);
      setOutOfBand(Boolean(below || above));
    } else {
      setOutOfBand(false);
    }
  }, [bands, change]);

  const handleDecision = async (decision: "APPROVE" | "REJECT") => {
    if (!canManage) {
      setShowUpgrade(true);
      return;
    }
    if (decision === "APPROVE" && outOfBand && !overrideChecked) {
      alert("Please confirm override to approve an out-of-band change.");
      return;
    }
    try {
      await decideCompChange(orgSlug, changeId, { decision, note: note || undefined });
      const res = await getCompChange(orgSlug, changeId);
      setChange(res || null);
    } catch (err: any) {
      alert(err?.message || "Unable to update");
    }
  };

  const handleApply = async () => {
    if (plan !== "SCALE") {
      setShowUpgrade(true);
      return;
    }
    try {
      await applyCompChange(orgSlug, changeId);
      const res = await getCompChange(orgSlug, changeId);
      setChange(res || null);
    } catch (err: any) {
      alert(err?.message || "Apply failed");
    }
  };

  const approvals = change?.approvals || [];
  const canDecide = approvals.some((a: any) => a.status === "PENDING");

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading…</div>;
  if (error) return <SupportErrorCard title="Comp change" message={error} requestId={requestId} />;
  if (!change) return <div className="p-6 text-sm text-slate-600">Not found.</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Comp change</p>
            <h1 className="text-2xl font-semibold text-slate-900">{change.employeeName || "Employee"}</h1>
            <p className="text-sm text-slate-600">
              Effective {change.effectiveDate || "—"} · {change.payType || "—"} · {change.amount ? `$${change.amount}` : "—"}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {change.status || "PENDING"}
            </span>
            {change.applyStatus ? (
              <div className="text-xs text-slate-600">Apply: {change.applyStatus}</div>
            ) : null}
            {change.applyError ? (
              <div className="text-[11px] text-rose-600">Error: {change.applyError}</div>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Requested by {change.requestedBy || "—"}</p>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Approvals</h2>
        </div>
        {outOfBand ? (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            This request is outside the configured pay band
            {bandMatch?.min != null || bandMatch?.max != null
              ? ` (${bandMatch?.min != null ? `$${bandMatch.min}` : "—"} - ${
                  bandMatch?.max != null ? `$${bandMatch.max}` : "—"
                })`
              : ""}.
            <a
              className="ml-2 font-semibold text-amber-900 underline"
              href={`/org/${orgSlug}/payroll/bands`}
            >
              View pay bands
            </a>
          </div>
        ) : null}
        <div className="space-y-2">
          {approvals.length === 0 ? (
            <p className="text-sm text-slate-600">No approvals yet.</p>
          ) : (
            approvals.map((a: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <div>
                  <p className="font-semibold text-slate-900">{a.actor || a.role || "Approver"}</p>
                  <p className="text-xs text-slate-500">
                    {a.status || "PENDING"} {a.decidedAt ? `· ${a.decidedAt}` : ""}{" "}
                    {a.note ? `· ${a.note}` : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {canDecide && canManage ? (
          <div className="mt-3 space-y-2">
            {outOfBand ? (
              <label className="flex items-center gap-2 text-sm text-amber-900">
                <input
                  type="checkbox"
                  checked={overrideChecked}
                  onChange={(e) => setOverrideChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-amber-300"
                />
                Override pay band and approve anyway
              </label>
            ) : null}
            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Note (optional)</span>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => void handleDecision("APPROVE")}
                disabled={outOfBand && !overrideChecked}
              >
                Approve
              </Button>
              <Button variant="outline" onClick={() => void handleDecision("REJECT")}>
                Reject
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {change.status === "APPROVED" ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Apply change</h2>
              <p className="text-xs text-slate-600">Apply to QuickBooks or export payload.</p>
            </div>
            {plan === "SCALE" ? (
              <Button onClick={() => void handleApply()} disabled={change.applyStatus === "QUEUED"}>
                {change.applyStatus === "QUEUED" ? "Queued…" : "Apply to QuickBooks"}
              </Button>
            ) : (
              <Button onClick={() => setShowUpgrade(true)}>Apply to QuickBooks</Button>
            )}
          </div>
          {change.applyStatus === "FAILED" ? (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Failed: {change.applyError || "Unknown error"}
              <Button size="sm" variant="outline" className="ml-2" onClick={() => void handleApply()}>
                Retry
              </Button>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const res = await exportCompChange(orgSlug, changeId);
                  setExportData(res || {});
                } catch (err: any) {
                  alert(err?.message || "Unable to export");
                }
              }}
            >
              Export payload
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-xs text-indigo-700"
            >
              <a href={`/org/${orgSlug}/payroll/reconciliation`}>Verify in reconciliation →</a>
            </Button>
          </div>
        </div>
      ) : null}

      {exportData ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Export payload</h3>
              <p className="text-xs text-slate-600">Use this to apply manually in QuickBooks.</p>
            </div>
            <button
              className="text-xs text-indigo-700 hover:underline"
              onClick={() => {
                navigator.clipboard?.writeText(JSON.stringify(exportData, null, 2));
              }}
            >
              Copy JSON
            </button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950/90 p-3 text-xs text-slate-100">
            {JSON.stringify(exportData, null, 2)}
          </pre>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-slate-700">
            <li>Open QuickBooks Payroll → Employee → Pay</li>
            <li>Apply changes effective date</li>
            <li>Confirm schedule/rate</li>
          </ol>
        </div>
      ) : null}

      <UpgradeToScaleModal open={showUpgrade} onClose={() => setShowUpgrade(false)} orgSlug={orgSlug} />
    </div>
  );
}
