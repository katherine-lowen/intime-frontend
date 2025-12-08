// src/app/jobs/components/JobForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type JobPayload = {
  title: string;
  location?: string | null;
  department?: string | null;
  employmentType?: string | null;
  seniority?: string | null;
  description?: string | null;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
};

type JobFormProps = {
  mode: "create" | "edit";
  jobId?: string;
  initialJob?: JobPayload | null;
  onSaved?: (jobId: string) => void;
};

const currencyOptions = ["USD", "EUR", "GBP"];
const employmentTypes = ["FULL_TIME", "PART_TIME", "CONTRACT"];
const seniorities = ["Junior", "Mid", "Senior", "Lead", "Manager"];
const locations = ["Remote", "Hybrid", "In-office"];

export function JobForm({ mode, jobId, initialJob, onSaved }: JobFormProps) {
  const router = useRouter();
  const [payload, setPayload] = useState<JobPayload>({
    title: "",
    location: "",
    department: "",
    employmentType: "",
    seniority: "",
    description: "",
    compensationMin: null,
    compensationMax: null,
    compensationCurrency: "USD",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialJob) {
      setPayload((prev) => ({
        ...prev,
        ...initialJob,
        compensationCurrency: initialJob.compensationCurrency || "USD",
      }));
    }
  }, [initialJob]);

  const isValid = useMemo(() => payload.title.trim().length > 0, [payload.title]);

  const updateField = <K extends keyof JobPayload>(key: K, value: JobPayload[K]) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let savedId = jobId;
      if (mode === "create") {
        const created = await api.post<{ id: string }>("/jobs", {
          ...payload,
        });
        savedId = created?.id || savedId;
      } else if (mode === "edit" && jobId) {
        const updated = await api.patch<{ id: string }>(`/jobs/${jobId}`, {
          ...payload,
        });
        savedId = updated?.id || jobId;
      }

      if (!savedId) throw new Error("Job id missing after save.");

      if (onSaved) onSaved(savedId);
      router.push(`/jobs/${savedId}/pipeline`);
    } catch (err: any) {
      console.error("[JobForm] save failed", err);
      setError(err?.message || "Failed to save job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Title *</label>
          <input
            value={payload.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Senior Product Manager"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Department</label>
          <input
            value={payload.department ?? ""}
            onChange={(e) => updateField("department", e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Engineering, Sales"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Location</label>
          <select
            value={payload.location ?? ""}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Employment type</label>
          <select
            value={payload.employmentType ?? ""}
            onChange={(e) => updateField("employmentType", e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select type</option>
            {employmentTypes.map((et) => (
              <option key={et} value={et}>
                {et.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Seniority</label>
          <select
            value={payload.seniority ?? ""}
            onChange={(e) => updateField("seniority", e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select seniority</option>
            {seniorities.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Compensation min</label>
          <input
            type="number"
            value={payload.compensationMin ?? ""}
            onChange={(e) =>
              updateField(
                "compensationMin",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="50000"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Compensation max</label>
          <input
            type="number"
            value={payload.compensationMax ?? ""}
            onChange={(e) =>
              updateField(
                "compensationMax",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="120000"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Currency</label>
          <select
            value={payload.compensationCurrency ?? "USD"}
            onChange={(e) => updateField("compensationCurrency", e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700">Description</label>
        <textarea
          value={payload.description ?? ""}
          onChange={(e) => updateField("description", e.target.value)}
          rows={6}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Describe the role responsibilities, requirements, and expectations."
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/jobs")}
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || saving}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create job" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
