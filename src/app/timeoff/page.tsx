// src/app/timeoff/new/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

type EmployeeLite = {
  id: string;
  firstName: string;
  lastName: string;
  department?: string | null;
};

const TIME_OFF_OPTIONS: { value: TimeOffType; label: string }[] = [
  { value: "PTO", label: "Vacation / PTO" },
  { value: "SICK", label: "Sick leave" },
  { value: "PERSONAL", label: "Personal day" },
  { value: "UNPAID", label: "Unpaid leave" },
  { value: "JURY_DUTY", label: "Jury duty" },
  { value: "PARENTAL_LEAVE", label: "Parental leave" },
];

async function fetchEmployees(): Promise<EmployeeLite[]> {
  try {
    const data = await api.get<EmployeeLite[]>("/employees");
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    console.error("Failed to load employees for time off form", err);
    return [];
  }
}

export default function NewTimeOffRequestPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeLite[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [employeeId, setEmployeeId] = useState<string>("");
  const [type, setType] = useState<TimeOffType>("PTO");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await fetchEmployees();
      if (!cancelled) {
        setEmployees(list);
        if (list.length > 0) {
          setEmployeeId(list[0].id);
        }
        setLoadingEmployees(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("Select an employee to continue.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Start and end dates are required.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/timeoff/requests", {
        employeeId,
        type,
        startDate,
        endDate,
        reason: reason || null,
        // policyId: can plug in later if you want explicit policy selection
      });

      router.push("/timeoff");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong submitting the request. Check the API or try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGate>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            New time off request
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Capture a time off request for an employee. Later, employees will
            submit these themselves from their portal.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee */}
            <div className="space-y-1">
              <label
                htmlFor="employee"
                className="text-xs font-medium text-slate-700"
              >
                Employee
              </label>
              <select
                id="employee"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={loadingEmployees}
              >
                {loadingEmployees && (
                  <option value="">Loading employees…</option>
                )}
                {!loadingEmployees && employees.length === 0 && (
                  <option value="">No employees found</option>
                )}
                {!loadingEmployees &&
                  employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                      {emp.department ? ` · ${emp.department}` : ""}
                    </option>
                  ))}
              </select>
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={type}
                onChange={(e) => setType(e.target.value as TimeOffType)}
              >
                {TIME_OFF_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label
                htmlFor="reason"
                className="text-xs font-medium text-slate-700"
              >
                Notes (optional)
              </label>
              <textarea
                id="reason"
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Anything the manager should know about this request."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => router.push("/timeoff")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loadingEmployees}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </AuthGate>
  );
}
