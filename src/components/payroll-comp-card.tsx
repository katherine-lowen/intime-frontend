"use client";

import { useEffect, useState, FormEvent } from "react";

type PayType = "SALARY" | "HOURLY" | "CONTRACTOR";
type PaySchedule = "WEEKLY" | "BIWEEKLY" | "SEMI_MONTHLY" | "MONTHLY" | "OTHER";
type PayrollProvider = "NONE" | "GUSTO" | "ADP" | "RIPPLING" | "DEEL" | "OTHER";

type PayrollInitial = {
  payType: PayType | null;
  basePayCents: number | null;
  payCurrency: string;
  paySchedule: PaySchedule | null;
  payrollProvider: PayrollProvider;
  payrollExternalId: string | null;
};

export type PayrollCompCardProps = {
  // Option 1: full employee object (Person page)
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string | null;
    department?: string | null;
  };

  // Option 2: just an ID + optional initial values (payroll page)
  employeeId?: string;
  initial?: PayrollInitial;
};

type EmployeeWithCompResponse = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  payType?: PayType | null;
  basePayCents?: number | null;
  payCurrency?: string | null;
  paySchedule?: PaySchedule | null;
  payrollProvider?: PayrollProvider | null;
  payrollExternalId?: string | null;
};

export default function PayrollCompCard(props: PayrollCompCardProps) {
  const { employee, employeeId, initial } = props;

  const resolvedEmployeeId = employee?.id ?? employeeId;
  const fullName =
    (employee
      ? `${employee.firstName} ${employee.lastName}`.trim()
      : "") || "this employee";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [payType, setPayType] = useState<PayType | "">("");
  const [basePayInput, setBasePayInput] = useState(""); // display in whole currency units
  const [payCurrency, setPayCurrency] = useState("USD");
  const [paySchedule, setPaySchedule] = useState<PaySchedule | "">("");
  const [payrollProvider, setPayrollProvider] =
    useState<PayrollProvider | "">("");
  const [payrollExternalId, setPayrollExternalId] = useState("");

  // Hydrate from optional initial props (used by /payroll page)
  useEffect(() => {
    if (!initial) return;

    if (initial.payType) setPayType(initial.payType);
    if (initial.basePayCents != null) {
      const dollars = Math.round(initial.basePayCents / 100);
      setBasePayInput(String(dollars));
    }
    if (initial.payCurrency) setPayCurrency(initial.payCurrency);
    if (initial.paySchedule) setPaySchedule(initial.paySchedule);
    if (initial.payrollProvider) setPayrollProvider(initial.payrollProvider);
    if (initial.payrollExternalId) {
      setPayrollExternalId(initial.payrollExternalId);
    }
  }, [initial]);

  // Load current compensation from backend
  useEffect(() => {
    async function loadComp() {
      if (!resolvedEmployeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
        const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

        const res = await fetch(`${baseUrl}/employees/${resolvedEmployeeId}`, {
          headers: {
            "x-org-id": orgId,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load employee comp:", res.status, text);
          throw new Error("Failed to load compensation.");
        }

        const data = (await res.json()) as EmployeeWithCompResponse;

        if (!initial) {
          // Only override from API if we didn't already prefill from `initial`
          if (data.payType) setPayType(data.payType);
          if (data.basePayCents != null) {
            const dollars = Math.round(data.basePayCents / 100);
            setBasePayInput(String(dollars));
          }
          if (data.payCurrency) setPayCurrency(data.payCurrency);
          if (data.paySchedule) setPaySchedule(data.paySchedule);
          if (data.payrollProvider) setPayrollProvider(data.payrollProvider);
          if (data.payrollExternalId) {
            setPayrollExternalId(data.payrollExternalId);
          }
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load compensation.");
      } finally {
        setLoading(false);
      }
    }

    void loadComp();
  }, [resolvedEmployeeId, initial]);

  function parseBasePayCents(input: string): number | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const asNumber = Number(trimmed.replace(/,/g, ""));
    if (!Number.isFinite(asNumber) || asNumber < 0) return null;
    // treat input as whole currency units, convert to cents
    return Math.round(asNumber * 100);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedMessage(null);

    if (!resolvedEmployeeId) {
      setError("Missing employee ID.");
      return;
    }

    setSaving(true);
    try {
      const basePayCents = parseBasePayCents(basePayInput);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

      const res = await fetch(
        `${baseUrl}/employees/${resolvedEmployeeId}/compensation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-org-id": orgId,
          },
          body: JSON.stringify({
            payType: payType || null,
            basePayCents,
            payCurrency: payCurrency || "USD",
            paySchedule: paySchedule || null,
            payrollProvider: payrollProvider || "NONE",
            payrollExternalId: payrollExternalId.trim() || null,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Update compensation failed:", res.status, text);
        throw new Error(`Update failed: ${res.status}`);
      }

      setSavedMessage("Compensation updated.");
    } catch (e: any) {
      setError(e?.message || "Failed to update compensation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Compensation
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Base pay and payroll details for {fullName}.
          </p>
        </div>
      </div>

      {!resolvedEmployeeId ? (
        <div className="text-xs text-red-600">
          Missing employee ID – cannot load compensation.
        </div>
      ) : loading ? (
        <div className="text-xs text-slate-500">Loading compensation…</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {error}
            </div>
          )}
          {savedMessage && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
              {savedMessage}
            </div>
          )}

          {/* Pay type + base pay */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[0.9fr_1.1fr]">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Pay type
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={payType}
                onChange={(e) => setPayType(e.target.value as PayType | "")}
              >
                <option value="">Not set</option>
                <option value="SALARY">Salary</option>
                <option value="HOURLY">Hourly</option>
                <option value="CONTRACTOR">Contractor</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Base pay (annual or hourly)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="120000"
                  value={basePayInput}
                  onChange={(e) => setBasePayInput(e.target.value)}
                />
                <select
                  className="w-24 rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={payCurrency}
                  onChange={(e) => setPayCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Enter whole currency amount (e.g. 120000 for $120k salary).
              </p>
            </div>
          </div>

          {/* Schedule + provider */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Pay schedule
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={paySchedule}
                onChange={(e) =>
                  setPaySchedule(e.target.value as PaySchedule | "")
                }
              >
                <option value="">Not set</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Biweekly</option>
                <option value="SEMI_MONTHLY">Semi-monthly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Payroll provider
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={payrollProvider}
                onChange={(e) =>
                  setPayrollProvider(e.target.value as PayrollProvider | "")
                }
              >
                <option value="">None</option>
                <option value="GUSTO">Gusto</option>
                <option value="ADP">ADP</option>
                <option value="RIPPLING">Rippling</option>
                <option value="DEEL">Deel</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
                External ID
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="ID in Gusto/ADP/Rippling"
                value={payrollExternalId}
                onChange={(e) => setPayrollExternalId(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                This should match the employee ID in your payroll system.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save compensation"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
