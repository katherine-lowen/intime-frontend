"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

export default function NewEmployeePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<EmployeeStatus>("ACTIVE");
  const [startDate, setStartDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (!email.trim()) {
      setError("Work email is required.");
      return;
    }

    setSaving(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

      const res = await fetch(`${baseUrl}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": orgId,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          title: title.trim() || null,
          department: department.trim() || null,
          location: location.trim() || null,
          status,
          startDate: startDate ? new Date(startDate).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Create employee failed:", res.status, txt);
        throw new Error(`Create failed: ${res.status}`);
      }

      // If backend returns the employee, grab id for redirect
      let id: string | null = null;
      try {
        const json = await res.json();
        if (json && typeof json.id === "string") {
          id = json.id;
        }
      } catch {
        // ignore, redirect back to people list
      }

      if (id) {
        router.push(`/people/${id}`);
      } else {
        router.push("/people");
      }
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create employee.");
      setSaving(false);
    }
  }

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">People / New employee</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Add employee
            </h1>
            <p className="text-sm text-slate-600">
              Create a person in Intime so you can track onboarding, time off,
              performance, and payroll.
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Name + Email */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                First name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Last name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Work email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Role / dept / location */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Title
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Department
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Location
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, US"
              />
            </div>
          </div>

          {/* Status + start date */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On leave</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="ALUMNI">Alumni</option>
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/people")}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create employee"}
            </button>
          </div>
        </form>
      </main>
    </AuthGate>
  );
}
