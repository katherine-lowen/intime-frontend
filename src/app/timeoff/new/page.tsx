// src/app/timeoff/new/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";

export default function NewTimeOffRequestPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employeeName, setEmployeeName] = useState("Taylor Rivers");
  const [type, setType] = useState("Vacation");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${base}/timeoff/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If your backend expects org header, you can add:
          // "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org",
        },
        body: JSON.stringify({
          employeeName,
          type,
          startDate,
          endDate,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // On success, go back to Time off list
      router.push("/timeoff");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong submitting the request. Check the API or try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="px-6 py-6">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            New PTO request
          </h1>
          <p className="text-sm text-slate-600">
            Log a time off request for an employee. Later this can be opened by
            employees in self-serve.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee */}
            <div className="space-y-1">
              <label
                htmlFor="employeeName"
                className="text-xs font-medium text-slate-700"
              >
                Employee
              </label>
              <input
                id="employeeName"
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label
                htmlFor="type"
                className="text-xs font-medium text-slate-700"
              >
                Type
              </label>
              <select
                id="type"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Vacation</option>
                <option>Sick leave</option>
                <option>Personal day</option>
                <option>Parental leave</option>
                <option>Bereavement</option>
                <option>Unpaid leave</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="startDate"
                  className="text-xs font-medium text-slate-700"
                >
                  Start date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="endDate"
                  className="text-xs font-medium text-slate-700"
                >
                  End date
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label
                htmlFor="notes"
                className="text-xs font-medium text-slate-700"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Context for the request, coverage notes, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
