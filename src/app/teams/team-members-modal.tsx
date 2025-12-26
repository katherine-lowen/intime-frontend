"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import type { Team } from "./types";

type EmployeeOption = {
  id: string;
  name: string;
  title?: string | null;
  department?: string | null;
};

export default function TeamMembersModal({
  team,
  onClose,
  onSaved,
}: {
  team: Team;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (team.members || []).map((m) => m.id)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.get<EmployeeOption[]>("/employees");
        if (!cancelled) setEmployees(data ?? []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load employees.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.patch(`/teams/${team.id}/members`, {
        memberIds: selectedIds,
      });
      onSaved();
    } catch (err: any) {
      setError(err?.message || "Failed to update team members.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Manage members — {team.name}
            </h2>
            <p className="text-[11px] text-slate-500">
              Add or remove employees from this team.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Employee</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {employees.map((emp) => {
                  const checked = selectedIds.includes(emp.id);
                  return (
                    <tr key={emp.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {emp.title ?? "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {emp.department ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={checked}
                          onChange={() => toggle(emp.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
