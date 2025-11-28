// src/app/people/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import { logSubmission } from "@/lib/submissions";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus;
  startDate?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = (params?.id ?? "") as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<EmployeeStatus>("ACTIVE");
  const [startDate, setStartDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 🔹 Load existing employee
  useEffect(() => {
    if (!employeeId) return;

    let cancelled = false;

    async function loadEmployee() {
      try {
        setLoading(true);
        setLoadError(null);

        const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
          headers: {
            "x-org-id": ORG_ID,
          },
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Failed to load employee (HTTP ${res.status}) ${txt}`);
        }

        const data = (await res.json()) as Employee;

        if (cancelled) return;

        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setEmail((data.email ?? "") as string);
        setTitle((data.title ?? "") as string);
        setDepartment((data.department ?? "") as string);
        setLocation((data.location ?? "") as string);
        setStatus((data.status as EmployeeStatus) ?? "ACTIVE");

        if (data.startDate) {
          const d = new Date(data.startDate);
          const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
          setStartDate(iso);
        } else {
          setStartDate("");
        }
      } catch (e: any) {
        if (!cancelled) {
          setLoadError(e?.message || "Failed to load employee.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEmployee();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setSaveError("First and last name are required.");
      return;
    }
    if (!email.trim()) {
      setSaveError("Work email is required.");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      title: title.trim() || null,
      department: department.trim() || null,
      location: location.trim() || null,
      status,
      startDate: startDate ? new Date(startDate).toISOString() : null,
    };

    setSaving(true);

    // 🔹 Log ATTEMPTED
    await logSubmission({
      action: "update_person",
      payload: { employeeId, ...payload },
      status: "ATTEMPTED",
    });

    try {
      const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": ORG_ID,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Update failed: HTTP ${res.status} ${txt}`);
      }

      // 🔹 Log SUCCESS
      await logSubmission({
        action: "update_person",
        payload: { employeeId, ...payload },
        status: "SUCCESS",
      });

      router.push(`/people/${employeeId}`);
      router.refresh();
    } catch (e: any) {
      const message = e?.message || "Failed to update employee.";
      setSaveError(message);

      // 🔹 Log FAILED
      await logSubmission({
        action: "update_person",
        payload: { employeeId, ...payload },
        status: "FAILED",
        error: message,
      });
    } finally {
      setSaving(false);
    }
  }

  const heading = loading
    ? "Loading employee…"
    : `Edit ${firstName || ""} ${lastName || ""}`.trim() || "Edit employee";

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => router.push(`/people/${employeeId}`)}
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back to profile
            </button>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {heading}
            </h1>
            <p className="text-sm text-slate-600">
              Update core details for this employee. Changes apply everywhere in
              Intime.
            </p>
          </div>
        </header>

        {/* Load error */}
        {loadError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {saveError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {saveError}
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
                disabled={loading || saving}
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
                disabled={loading || saving}
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
              disabled={loading || saving}
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
                disabled={loading || saving}
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
                disabled={loading || saving}
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
                disabled={loading || saving}
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
                onChange={(e) =>
                  setStatus(e.target.value as EmployeeStatus)
                }
                disabled={loading || saving}
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
                disabled={loading || saving}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/people/${employeeId}`)}
              className="text-sm text-slate-500 hover:text-slate-700"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving changes…" : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </AuthGate>
  );
}
