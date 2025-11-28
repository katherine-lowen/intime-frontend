// src/app/timeoff/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import { logSubmission } from "@/lib/submissions";

type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

type EmployeeOption = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  department?: string | null;
};

type TimeOffPolicyKind = "UNLIMITED" | "FIXED";

type PolicyOption = {
  id: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays?: number | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function NewTimeOffRequestPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [policies, setPolicies] = useState<PolicyOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [policyId, setPolicyId] = useState<string>(""); // "" = no policy
  const [type, setType] = useState<TimeOffType>("PTO");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setOptionsError(null);

        const [employeesRes, policiesRes] = await Promise.all([
          fetch(`${API_URL}/employees`, {
            headers: { "x-org-id": ORG_ID },
          }),
          fetch(`${API_URL}/timeoff/policies`, {
            headers: { "x-org-id": ORG_ID },
          }),
        ]);

        if (!employeesRes.ok) {
          const text = await employeesRes.text();
          console.error("Failed to load employees:", employeesRes.status, text);
          throw new Error("Failed to load employees");
        }
        if (!policiesRes.ok) {
          const text = await policiesRes.text();
          console.error("Failed to load policies:", policiesRes.status, text);
          throw new Error("Failed to load time off policies");
        }

        const employeesJson = (await employeesRes.json()) as EmployeeOption[];
        const policiesJson = (await policiesRes.json()) as PolicyOption[];

        setEmployees(employeesJson);
        setPolicies(policiesJson);

        // If there is at least one employee, pre-select the first
        if (employeesJson.length > 0) {
          setEmployeeId(employeesJson[0].id);
        }
      } catch (e: any) {
        setOptionsError(e?.message || "Failed to load employees/policies.");
      } finally {
        setLoadingOptions(false);
      }
    }

    void loadOptions();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("Select an employee.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Start and end dates are required.");
      return;
    }

    setSaving(true);

    const payload = {
      employeeId,
      policyId: policyId || null,
      type,
      startDate,
      endDate,
      reason: reason.trim() || null,
    };

    // 🔹 Log attempt to Obsession
    await logSubmission({
      action: "create_timeoff_request",
      status: "ATTEMPTED",
      payload,
    });

    try {
      const res = await fetch(`${API_URL}/timeoff/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": ORG_ID,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create time off request failed:", res.status, text);
        throw new Error(`Create failed: ${res.status}`);
      }

      // 🔹 Log success
      await logSubmission({
        action: "create_timeoff_request",
        status: "SUCCESS",
        payload,
      });

      router.push("/timeoff");
      router.refresh();
    } catch (e: any) {
      const message = e?.message || "Failed to create time off request.";
      setError(message);

      // 🔹 Log failure
      await logSubmission({
        action: "create_timeoff_request",
        status: "FAILED",
        payload,
        error: message,
      });
    } finally {
      setSaving(false);
    }
  }

  const hasEmployees = employees.length > 0;

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              New time off request
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Log time away for an employee and route it through your approval
              workflow.
            </p>
          </div>
        </header>

        {optionsError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {optionsError}
          </div>
        )}

        {!hasEmployees && !loadingOptions && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            You don&apos;t have any employees yet. Add people to your org before
            creating time off requests.
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Employee + Policy */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Employee
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!hasEmployees || loadingOptions}
              >
                {!hasEmployees && <option value="">No employees</option>}
                {hasEmployees &&
                  employees.map((emp) => {
                    const name =
                      [emp.firstName, emp.lastName].filter(Boolean).join(" ") ||
                      emp.email ||
                      "Employee";
                    const deptSuffix = emp.department
                      ? ` · ${emp.department}`
                      : "";
                    return (
                      <option key={emp.id} value={emp.id}>
                        {name}
                        {deptSuffix}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Policy (optional)
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                disabled={loadingOptions}
              >
                <option value="">No specific policy</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.kind === "FIXED" && p.annualAllowanceDays != null
                      ? ` · ${p.annualAllowanceDays} days`
                      : p.kind === "UNLIMITED"
                      ? " · Unlimited"
                      : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Linking a policy helps with reporting and balances, but isn&apos;t
                required to log a request.
              </p>
            </div>
          </div>

          {/* Type + Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Type
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={type}
                onChange={(e) => setType(e.target.value as TimeOffType)}
              >
                <option value="PTO">PTO</option>
                <option value="SICK">Sick</option>
                <option value="PERSONAL">Personal</option>
                <option value="UNPAID">Unpaid</option>
                <option value="JURY_DUTY">Jury duty</option>
                <option value="PARENTAL_LEAVE">Parental leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Start date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                End date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Reason (optional)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={3}
              placeholder="Context for the manager or HR (optional)."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/timeoff")}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !hasEmployees}
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create request"}
            </button>
          </div>
        </form>
      </main>
    </AuthGate>
  );
}
