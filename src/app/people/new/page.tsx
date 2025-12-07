// src/app/people/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type EmployeeListItem = {
  employeeId?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  status?: EmployeeStatus;
};

type CreateEmployeePayload = {
  firstName: string;
  lastName: string;
  email: string;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  managerId?: string | null;
  teamId?: string | null;
  startDate?: string | null; // ISO
};

export default function NewEmployeePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    department: "",
    location: "",
    managerId: "",
    startDate: "",
  });

  const [managers, setManagers] = useState<EmployeeListItem[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing employees for the "Manager" dropdown
  useEffect(() => {
    let cancelled = false;

    async function loadManagers() {
      setLoadingManagers(true);
      try {
        const data = await api.get<EmployeeListItem[]>("/employees");
        if (!cancelled) setManagers(data ?? []);
      } catch (err) {
        console.error("Failed to load managers", err);
        if (!cancelled) setManagers([]);
      } finally {
        if (!cancelled) setLoadingManagers(false);
      }
    }

    void loadManagers();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateEmployeePayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        title: form.title.trim() || null,
        department: form.department.trim() || null,
        location: form.location.trim() || null,
        managerId: form.managerId || null,
        startDate: form.startDate
          ? new Date(form.startDate).toISOString()
          : null,
      };

      const created = await api.post<{
        employeeId: string;
        firstName: string;
        lastName: string;
      }>("/employees", payload);

      if (created?.employeeId) {
        router.push(`/people/${created.employeeId}`);
      } else {
        router.push("/people");
      }
    } catch (err: any) {
      console.error("Create employee failed", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong creating the employee."
      );
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/people" className="text-indigo-600 hover:underline">
          People
        </Link>
        <span className="text-slate-300">/</span>
        <span>New employee</span>
      </div>

      {/* Header */}
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Add employee
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a new employee profile in this Intime workspace.
          </p>
        </div>
        <Link
          href="/people"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Name + email */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              First name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
              placeholder="Steven"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Last name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
              placeholder="Meoni"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Work email<span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
            placeholder="name@company.com"
          />
        </div>

        {/* Role / dept / location */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
              placeholder="Senior Engineer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Department
            </label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => updateField("department", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
              placeholder="Technology"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
              placeholder="Miami, FL (Remote)"
            />
          </div>
        </div>

        {/* Manager + start date */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Manager
            </label>
            <select
              value={form.managerId}
              onChange={(e) => updateField("managerId", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
              disabled={loadingManagers}
            >
              <option value="">No manager</option>
              {managers.map((m) => {
                const id = m.employeeId || m.id!;
                const label = `${m.firstName} ${m.lastName}`;
                return (
                  <option key={id} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Start date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500">
            You can connect onboarding flows, time off policies, and payroll
            details after creating the profile.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create employee"}
          </button>
        </div>
      </form>
    </main>
  );
}
