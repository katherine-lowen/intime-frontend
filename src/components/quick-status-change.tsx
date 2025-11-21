"use client";

import { useState } from "react";
import api from "@/lib/api";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On leave",
  CONTRACTOR: "Contractor",
  ALUMNI: "Alumni",
};

export default function QuickStatusChange({
  employeeId,
  initialStatus,
}: {
  employeeId: string;
  initialStatus: EmployeeStatus | null | undefined;
}) {
  const [status, setStatus] = useState<EmployeeStatus>(
    initialStatus ?? "ACTIVE",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: EmployeeStatus) {
    setStatus(next);
    setSaving(true);
    setError(null);

    try {
      await api.patch(`/employees/${employeeId}`, {
        status: next,
      });
      // backend already logs STATUS_CHANGE event; nothing else to do
    } catch (err) {
      console.error("Failed to update status", err);
      setError("Could not update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 text-xs">
      <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        Status
      </label>
      <select
        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700"
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as EmployeeStatus)}
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-[10px] text-red-500 leading-tight">{error}</span>
      )}
    </div>
  );
}
