"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";
import { createCompChange, listCompChanges } from "@/lib/payroll-api";

const TABS = ["PENDING", "APPROVED", "REJECTED", "APPLIED", "ALL"] as const;

export default function CompChangesClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const canManage = plan === "GROWTH" || plan === "SCALE";
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("PENDING");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [employee, setEmployee] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [payType, setPayType] = useState("SALARY");
  const [amount, setAmount] = useState("");
  const [paySchedule, setPaySchedule] = useState("");
  const [reason, setReason] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const presetEmp = searchParams?.get("employeeId") || "";
    if (presetEmp) setEmployee(presetEmp);
  }, [searchParams]);

  const filteredStatus = useMemo(() => (tab === "ALL" ? undefined : tab), [tab]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listCompChanges(orgSlug, {
          status: filteredStatus,
          employeeId: employee || undefined,
        });
        if (!cancelled) setItems(res || []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load compensation changes");
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
  }, [orgSlug, filteredStatus]);

  const onCreate = async () => {
    if (!canManage) {
      setShowUpgrade(true);
      return;
    }
    try {
      await createCompChange(orgSlug, {
        employeeId: employee,
        effectiveDate,
        payType,
        amount: amount ? Number(amount) : null,
        paySchedule: paySchedule || null,
        reason: reason || null,
      });
      setModalOpen(false);
      setEffectiveDate("");
      setAmount("");
      setPaySchedule("");
      setReason("");
      setTab("PENDING");
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Unable to create change");
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
          <h1 className="text-2xl font-semibold text-slate-900">Compensation changes</h1>
        </div>
        <Button onClick={() => (canManage ? setModalOpen(true) : setShowUpgrade(true))}>
          New change
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              tab === t ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {error ? <SupportErrorCard title="Comp changes" message={error} requestId={requestId} /> : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No changes found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Requested by</th>
                <th className="px-3 py-2">Effective</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-sm text-slate-800">{item.employeeName || item.employeeId || "Employee"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{item.requestedBy || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{item.effectiveDate || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{item.status || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{item.updatedAt || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    <Link
                      className="text-indigo-700 hover:underline"
                      href={`/org/${orgSlug}/payroll/comp-changes/${item.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">New compensation change</h2>
                <p className="text-sm text-slate-600">Submit for approval.</p>
              </div>
              <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Employee (ID or email)</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  placeholder="employee-id or email"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Effective date</span>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-700">
                  <span className="font-medium">Pay type</span>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={payType}
                    onChange={(e) => setPayType(e.target.value)}
                  >
                    <option value="SALARY">Salary</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm text-slate-700">
                  <span className="font-medium">Amount</span>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50000"
                  />
                </label>
              </div>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Pay schedule (optional)</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={paySchedule}
                  onChange={(e) => setPaySchedule(e.target.value)}
                  placeholder="Bi-weekly"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Reason (optional)</span>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void onCreate()} disabled={!employee || !effectiveDate || !amount}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <UpgradeToScaleModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        orgSlug={orgSlug}
      />
    </div>
  );
}
