"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type OnboardingTemplate = {
  id: string;
  name: string;
  description?: string | null;
};

type Employee = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

type EmployeesResponse =
  | { items: Employee[] }
  | { data: Employee[] }
  | { employees: Employee[] }
  | Employee[];

function normalizeEmployees(res?: EmployeesResponse): Employee[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as any).items)) return (res as any).items;
  if (Array.isArray((res as any).data)) return (res as any).data;
  if (Array.isArray((res as any).employees)) return (res as any).employees;
  return [];
}

export default function OnboardingAssignPage() {
  const [role, setRole] = useState<OrgRole | null>(null);
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const isManager = useMemo(
    () => role === "OWNER" || role === "ADMIN" || role === "MANAGER",
    [role]
  );

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const me = await getCurrentUser();
      const normalizedRole = (me?.role || "").toUpperCase() as OrgRole;
      if (!cancelled) setRole(normalizedRole);
      if (normalizedRole === "EMPLOYEE") {
        window.location.replace("/employee");
        return;
      }
      await Promise.all([fetchTemplates(), fetchEmployees()]);
      if (!cancelled) setLoading(false);
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function fetchTemplates() {
    try {
      const data = await api.get<OnboardingTemplate[]>("/onboarding/templates");
      setTemplates(data ?? []);
    } catch (err: any) {
      console.error("[onboarding assign] templates fetch failed", err);
      setError(err?.message || "Failed to load templates.");
    }
  }

  async function fetchEmployees() {
    try {
      const data = await api.get<EmployeesResponse>("/employees?page=1&pageSize=200");
      setEmployees(normalizeEmployees(data));
    } catch (err: any) {
      console.error("[onboarding assign] employees fetch failed", err);
      setError(err?.message || "Failed to load employees.");
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    if (!selectedTemplate || selectedEmployeeIds.length === 0) {
      setError("Please choose a template and at least one employee.");
      return;
    }
    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/onboarding/assign", {
        templateId: selectedTemplate,
        employeeIds: selectedEmployeeIds,
        startDate: startDate || undefined,
      });
      setSuccess("Onboarding assigned successfully.");
      setSelectedEmployeeIds([]);
      setSelectedTemplate("");
      setStartDate("");
    } catch (err: any) {
      console.error("[onboarding assign] assign failed", err);
      setError(err?.message || "Failed to assign onboarding.");
    } finally {
      setAssigning(false);
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 w-48 rounded bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Onboarding
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Assign onboarding</h1>
            <p className="text-sm text-slate-600">
              Choose a template, select employees, and optionally set a start date.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800">
              {success} — <a href="/onboarding/assignments" className="underline">View onboarding progress</a>
            </div>
          )}

          {!isManager && !loading ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have access to onboarding assignments.
            </div>
          ) : loading ? (
            renderSkeleton()
          ) : (
            <form
              onSubmit={handleAssign}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select a template</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Employees
                </label>
                <select
                  multiple
                  value={selectedEmployeeIds}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                    setSelectedEmployeeIds(opts);
                  }}
                  className="h-48 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                        emp.email ||
                        emp.id}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Hold Cmd/Ctrl to select multiple employees.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500">
                  Leave blank to start today.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <a
                  href="/onboarding/assignments"
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View progress
                </a>
                <button
                  type="submit"
                  disabled={assigning}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assigning ? "Assigning…" : "Assign"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
