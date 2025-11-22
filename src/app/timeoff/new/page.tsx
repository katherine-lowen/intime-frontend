// src/app/timeoff/new/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function NewTimeOffRequestPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [type, setType] = useState("VACATION");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load employees so we can send a valid employeeId to the backend
  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      try {
        const data = await api.get<Employee[]>("/employees");
        if (!cancelled) {
          setEmployees(data);
          if (data.length > 0) {
            setEmployeeId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load employees", err);
        if (!cancelled) {
          setError("Couldn't load employees. Check the API.");
        }
      }
    }

    loadEmployees();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("Select an employee before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/timeoff/requests", {
        employeeId,
        type,        // e.g. "VACATION", "SICK", etc. (enum-friendly)
        startDate,
        endDate,
        notes: notes || null,
      });

      router.push("/timeoff");
      router.refresh();
    } catch (err: unknown) {
      console.error("Failed to submit time off request", err);
      setError(
        "Something went wrong submitting the request. Check the API or try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthGate>
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
                  htmlFor="employeeId"
                  className="text-xs font-medium text-slate-700"
                >
                  Employee
                </label>
                <select
                  id="employeeId"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={employees.length === 0}
                >
                  {employees.length === 0 ? (
                    <option value="">Loading employees…</option>
                  ) : (
                    employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))
                  )}
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="VACATION">Vacation</option>
                  <option value="SICK">Sick leave</option>
                  <option value="PERSONAL">Personal day</option>
                  <option value="PARENTAL">Parental leave</option>
                  <option value="BEREAVEMENT">Bereavement</option>
                  <option value="UNPAID">Unpaid leave</option>
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
    </AuthGate>
  );
}
