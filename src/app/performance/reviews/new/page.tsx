// src/app/performance/reviews/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";

type EmployeeOption = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function NewPerformanceReviewPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [period, setPeriod] = useState("");
  const [rating, setRating] = useState("");
  const [managerSummary, setManagerSummary] = useState("");
  const [employeeSummary, setEmployeeSummary] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load employees for the dropdown
  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoadingEmployees(true);
        setEmployeesError(null);

        const res = await fetch(`${API_URL}/employees`, {
          headers: { "x-org-id": ORG_ID },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load employees:", res.status, text);
          throw new Error("Failed to load employees");
        }

        const data = (await res.json()) as EmployeeOption[];
        setEmployees(data);
        if (data.length > 0) setEmployeeId(data[0].id);
      } catch (e: any) {
        setEmployeesError(e?.message || "Failed to load employees.");
      } finally {
        setLoadingEmployees(false);
      }
    }

    void loadEmployees();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("Select an employee.");
      return;
    }
    if (!period.trim()) {
      setError("Review period is required (e.g. 2025 H1, Q3 2024).");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/performance-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": ORG_ID,
        },
        body: JSON.stringify({
          employeeId,
          period: period.trim(),
          rating: rating.trim() || null,
          managerSummary: managerSummary.trim() || null,
          employeeSummary: employeeSummary.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create performance review failed:", res.status, text);
        throw new Error(`Create failed: ${res.status}`);
      }

      router.push("/performance/reviews");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create performance review.");
    } finally {
      setSaving(false);
    }
  }

  const hasEmployees = employees.length > 0;

  return (
    <AuthGate>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Performance / New review</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Add performance review
            </h1>
            <p className="text-sm text-slate-600">
              Log a review period, rating, and summary for an employee.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/performance/reviews")}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← Back to reviews
          </button>
        </header>

        {employeesError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {employeesError}
          </div>
        )}

        {!hasEmployees && !loadingEmployees && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You don&apos;t have any employees yet. Add people to your org before
            logging reviews.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Employee + Period */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Employee
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!hasEmployees || loadingEmployees}
              >
                {!hasEmployees && <option value="">No employees</option>}
                {employees.map((e) => {
                  const name = `${e.firstName} ${e.lastName}`;
                  const meta = [e.title, e.department]
                    .filter(Boolean)
                    .join(" • ");
                  return (
                    <option key={e.id} value={e.id}>
                      {name}
                      {meta ? ` — ${meta}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Period
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 2025 H1, Q3 2024, FY25"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Rating (optional)
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder='e.g. "Exceeds expectations", "3.7/5"'
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Free-form so you can use your own scale (1–5, letters, etc.).
            </p>
          </div>

          {/* Manager summary */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Manager summary
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={4}
              placeholder="Key strengths, growth areas, and overall summary from the manager perspective."
              value={managerSummary}
              onChange={(e) => setManagerSummary(e.target.value)}
            />
          </div>

          {/* Employee summary */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Employee self-review (optional)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={3}
              placeholder="Paste or summarize the employee’s self-review here."
              value={employeeSummary}
              onChange={(e) => setEmployeeSummary(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/performance/reviews")}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !hasEmployees}
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create review"}
            </button>
          </div>
        </form>
      </main>
    </AuthGate>
  );
}
