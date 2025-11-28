// src/components/timeoff-policy-summary-card.tsx
"use client";

import { useEffect, useState } from "react";

type TimeOffPolicyKind = "UNLIMITED" | "FIXED";

type TimeOffPolicy = {
  id: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays?: number | null;
};

type EmployeeLite = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  department?: string | null;
  timeOffPolicyId?: string | null;
};

type PolicyWithCount = TimeOffPolicy & {
  employeeCount: number;
};

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function TimeoffPolicySummaryCard() {
  const [policies, setPolicies] = useState<PolicyWithCount[]>([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1) Load policies
        const policiesRes = await fetch(`${API_URL}/timeoff/policies`, {
          headers: { "x-org-id": ORG_ID },
          cache: "no-store",
        });

        if (!policiesRes.ok) {
          throw new Error(`Failed to load policies (${policiesRes.status})`);
        }

        const policiesData = (await policiesRes.json()) as TimeOffPolicy[];

        // 2) Load employees (lite list)
        const employeesRes = await fetch(`${API_URL}/employees`, {
          headers: { "x-org-id": ORG_ID },
          cache: "no-store",
        });

        if (!employeesRes.ok) {
          throw new Error(`Failed to load employees (${employeesRes.status})`);
        }

        const employees = (await employeesRes.json()) as EmployeeLite[];

        // 3) Compute counts per policy + unassigned
        const counts: Record<string, number> = {};
        let none = 0;

        for (const emp of employees) {
          const pid = emp.timeOffPolicyId ?? null;
          if (!pid) {
            none += 1;
          } else {
            counts[pid] = (counts[pid] ?? 0) + 1;
          }
        }

        const withCounts: PolicyWithCount[] = policiesData.map((p) => ({
          ...p,
          employeeCount: counts[p.id] ?? 0,
        }));

        if (!cancelled) {
          setPolicies(withCounts);
          setUnassignedCount(none);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load policy summary.");
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-700">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Policy coverage
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            How employees are distributed across your PTO plans.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500">Loading policy summary…</div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {error}
        </div>
      ) : policies.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          No PTO policies yet. Create one under{" "}
          <span className="font-medium">Time off → Policies</span>.
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {policies.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-slate-900">
                  {p.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {p.kind === "UNLIMITED"
                    ? "Unlimited PTO"
                    : p.annualAllowanceDays != null
                    ? `${p.annualAllowanceDays} days / year`
                    : "Fixed allowance"}
                </div>
              </div>
              <div className="ml-3 text-right">
                <div className="text-sm font-semibold text-slate-900">
                  {p.employeeCount}
                </div>
                <div className="text-[11px] text-slate-500">employees</div>
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[11px] font-medium text-slate-600">
              No policy assigned
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {unassignedCount}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
