// src/components/employee-timeoff-policy-card.tsx
"use client";

import { useEffect, useState } from "react";

type TimeOffPolicyKind = "UNLIMITED" | "FIXED";

type TimeOffPolicy = {
  id: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays?: number | null;
};

type EmployeeTimeoffPolicyCardProps = {
  employeeId: string;
};

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function EmployeeTimeoffPolicyCard({
  employeeId,
}: EmployeeTimeoffPolicyCardProps) {
  const [policies, setPolicies] = useState<TimeOffPolicy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // 1) load policies
        const policiesRes = await fetch(`${API_URL}/timeoff/policies`, {
          headers: { "x-org-id": ORG_ID },
          cache: "no-store",
        });

        if (!policiesRes.ok) {
          throw new Error(`Failed to load policies (${policiesRes.status})`);
        }

        const policiesData = (await policiesRes.json()) as TimeOffPolicy[];

        // 2) load employee to get existing policy (best-effort)
        let existingPolicyId = "";
        try {
          const empRes = await fetch(`${API_URL}/employees/${employeeId}`, {
            headers: { "x-org-id": ORG_ID },
            cache: "no-store",
          });
          if (empRes.ok) {
            const emp = (await empRes.json()) as any;
            existingPolicyId = emp.timeOffPolicyId ?? "";
          }
        } catch {
          // ignore; card still works, just won't preselect
        }

        if (!cancelled) {
          setPolicies(policiesData);
          setSelectedPolicyId(existingPolicyId);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load PTO policies.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/timeoff/assign-policy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": ORG_ID,
        },
        body: JSON.stringify({
          employeeId,
          policyId: selectedPolicyId || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Save failed (${res.status}) ${text}`);
      }

      setSuccess("Time off policy updated.");
    } catch (e: any) {
      setError(e?.message || "Failed to update policy.");
    } finally {
      setSaving(false);
    }
  }

  const hasPolicies = policies.length > 0;

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-700 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            PTO policy
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Assign which time off policy applies to this employee.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500">Loading policies…</div>
      ) : !hasPolicies ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          No PTO policies yet. Create one under{" "}
          <span className="font-medium">Time off → Policies</span>.
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Assigned policy
            </label>
            <select
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">No policy assigned</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{" "}
                  {p.kind === "UNLIMITED"
                    ? "(Unlimited)"
                    : p.annualAllowanceDays != null
                    ? `(${p.annualAllowanceDays} days / yr)`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save policy"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
