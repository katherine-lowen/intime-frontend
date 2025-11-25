// src/components/apply-onboarding-template-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";

type EmployeeOption = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

export default function ApplyOnboardingTemplateForm({
  templateId,
  employees,
}: {
  templateId: string;
  employees: EmployeeOption[];
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!employeeId) {
      setError("Select an employee to apply this template to.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post(`/onboarding/templates/${templateId}/apply`, {
        employeeId,
      });
      setMessage("Onboarding flow created for this employee.");
    } catch (err) {
      console.error("Failed to apply template", err);
      setError("Something went wrong applying this template.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Apply to employee
        </label>
        <p className="text-xs text-slate-500">
          Creates an onboarding flow and checklist for the selected person.
        </p>
        <select
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">Select an employee…</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName}
              {e.title ? ` — ${e.title}` : ""}
              {e.department ? ` (${e.department})` : ""}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {message && <p className="text-xs text-emerald-700">{message}</p>}

      <button
        type="submit"
        disabled={loading || !employees.length}
        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "Applying…" : "Apply template"}
      </button>
    </form>
  );
}
