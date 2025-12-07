// src/app/learning/components/BulkAssignModal.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type LearningPathOption = { id: string; name: string };

type BulkAssignModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function BulkAssignModal({ open, onClose, onSuccess }: BulkAssignModalProps) {
  const [paths, setPaths] = useState<LearningPathOption[]>([]);
  const [pathId, setPathId] = useState<string>("");
  const [departments, setDepartments] = useState<string>("");
  const [roles, setRoles] = useState<string>("");
  const [locations, setLocations] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.get<LearningPathOption[]>("/learning/paths");
        if (cancelled) return;
        setPaths(data ?? []);
      } catch (err) {
        // fail silent
      }
    }
    if (open) void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathId) {
      setError("Select a learning path first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        pathId,
        departments: splitMulti(departments),
        roles: splitMulti(roles),
        locations: splitMulti(locations),
        dueDate: dueDate || null,
      };
      await api.post(`/learning/paths/${pathId}/assign/bulk`, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to assign path.");
    } finally {
      setLoading(false);
    }
  };

  function splitMulti(value: string): string[] {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Bulk assign learning</h3>
            <p className="text-xs text-slate-600">
              Assign a path to teams by department, role, or location.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Learning path</label>
            <select
              value={pathId}
              onChange={(e) => setPathId(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select a path</option>
              {paths.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Departments (comma-separated)
            </label>
            <input
              value={departments}
              onChange={(e) => setDepartments(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Engineering, Sales"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Roles (comma-separated)
            </label>
            <input
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Manager, IC"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Locations (comma-separated)
            </label>
            <input
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="SF, Remote US"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Due date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Assigning…" : "Assign path"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
