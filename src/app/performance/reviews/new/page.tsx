// src/app/performance/reviews/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";

type EmployeeOption = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  title?: string | null;
  department?: string | null;
};

type RatingOption =
  | "Needs improvement"
  | "Meets expectations"
  | "Exceeds expectations"
  | "Outstanding";

function getEmployeeLabel(e: EmployeeOption) {
  const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
  const main = name || e.email || "Employee";
  const suffix = e.title ? ` · ${e.title}` : "";
  return main + suffix;
}

function NewPerformanceReviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams(); // may be null in some Next types

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [period, setPeriod] = useState("");
  const [rating, setRating] = useState<RatingOption | "">("");
  const [managerSummary, setManagerSummary] = useState("");
  const [employeeSummary, setEmployeeSummary] = useState("");
  const [rawManagerFeedback, setRawManagerFeedback] = useState("");
  const [rawSelfReview, setRawSelfReview] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployees() {
      try {
        setEmployeesLoading(true);
        setEmployeesError(null);

        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
        const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

        const res = await fetch(`${baseUrl}/employees`, {
          headers: { "x-org-id": orgId },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load employees:", res.status, text);
          throw new Error("Failed to load employees");
        }

        const data = (await res.json()) as EmployeeOption[];
        setEmployees(data);

        // ✅ Safe guard: searchParams may be null
        const preselectId = searchParams ? searchParams.get("employeeId") : null;

        if (preselectId && data.some((e) => e.id === preselectId)) {
          setEmployeeId(preselectId);
        } else if (data.length > 0) {
          setEmployeeId(data[0].id);
        }
      } catch (e: any) {
        setEmployeesError(e?.message || "Failed to load employees.");
      } finally {
        setEmployeesLoading(false);
      }
    }

    void loadEmployees();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("Select an employee for this review.");
      return;
    }

    setSaving(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

      const res = await fetch(`${baseUrl}/performance/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": orgId,
        },
        body: JSON.stringify({
          employeeId,
          period: period.trim() || null,
          rating: rating || null,
          managerSummary: managerSummary.trim() || null,
          employeeSummary: employeeSummary.trim() || null,
          rawManagerFeedback: rawManagerFeedback.trim() || null,
          rawSelfReview: rawSelfReview.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create performance review failed:", res.status, text);
        throw new Error(`Create failed: ${res.status}`);
      }

      const created = (await res.json()) as { id?: string };
      if (created?.id) {
        router.push(`/performance/reviews/${created.id}`);
      } else {
        router.push("/performance/reviews");
      }
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create performance review.");
    } finally {
      setSaving(false);
    }
  }

  const hasEmployees = employees.length > 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            New performance review
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Capture feedback and ratings for a single review cycle.
          </p>
        </div>
      </header>

      {employeesError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {employeesError}
        </div>
      )}

      {!hasEmployees && !employeesLoading && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You don&apos;t have any employees yet. Add people to your org before
          creating performance reviews.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Employee + Period */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Employee
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={!hasEmployees || employeesLoading}
            >
              {!hasEmployees && <option value="">No employees</option>}
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {getEmployeeLabel(e)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Period
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="H2 2025, Q1 2025, Annual 2025..."
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
            Rating
          </label>
          <select
            className="mt-1 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={rating}
            onChange={(e) => setRating(e.target.value as RatingOption | "")}
          >
            <option value="">No rating</option>
            <option value="Needs improvement">Needs improvement</option>
            <option value="Meets expectations">Meets expectations</option>
            <option value="Exceeds expectations">Exceeds expectations</option>
            <option value="Outstanding">Outstanding</option>
          </select>
        </div>

        {/* Summaries */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Manager summary
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={3}
              placeholder="High-level summary of performance for this period."
              value={managerSummary}
              onChange={(e) => setManagerSummary(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Employee summary (optional)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={3}
              placeholder="Employee&apos;s self-assessment for the period."
              value={employeeSummary}
              onChange={(e) => setEmployeeSummary(e.target.value)}
            />
          </div>
        </div>

        {/* Raw notes */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Manager notes (raw)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={4}
              placeholder="Bullets, examples, or more detailed notes for your own records."
              value={rawManagerFeedback}
              onChange={(e) => setRawManagerFeedback(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Self-review notes (raw)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={4}
              placeholder="Employee&apos;s raw notes, pasted or uploaded from your process."
              value={rawSelfReview}
              onChange={(e) => setRawSelfReview(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.push("/performance")}
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
  );
}

export default function NewPerformanceReviewPage() {
  return (
    <AuthGate>
      <NewPerformanceReviewInner />
    </AuthGate>
  );
}
