"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { PlanGate, type Plan } from "@/components/PlanGate";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type OnboardingTemplate = {
  id: string;
  name: string;
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

type Assignment = {
  id: string;
  employeeId: string;
  employeeName?: string | null;
  templateId: string;
  templateName?: string | null;
  totalTasks?: number | null;
  completedTasks?: number | null;
  updatedAt?: string | null;
};

function normalizeEmployees(res?: EmployeesResponse): Employee[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as any).items)) return (res as any).items;
  if (Array.isArray((res as any).data)) return (res as any).data;
  if (Array.isArray((res as any).employees)) return (res as any).employees;
  return [];
}

export default function OnboardingAssignmentsPage() {
  const { orgSlug, loading: orgLoading } = useCurrentOrg();
  const [role, setRole] = useState<OrgRole | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateFilter, setTemplateFilter] = useState<string>("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");

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
      await Promise.all([fetchTemplates(), fetchEmployees(), fetchAssignments()]);
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
      console.error("[onboarding assignments] templates fetch failed", err);
    }
  }

  async function fetchEmployees() {
    try {
      const data = await api.get<EmployeesResponse>("/employees?page=1&pageSize=200");
      setEmployees(normalizeEmployees(data));
    } catch (err: any) {
      console.error("[onboarding assignments] employees fetch failed", err);
    }
  }

  async function fetchAssignments() {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (templateFilter) params.set("templateId", templateFilter);
      if (employeeFilter) params.set("employeeId", employeeFilter);
      const data = await api.get<Assignment[]>(
        `/onboarding/assignments${params.toString() ? `?${params.toString()}` : ""}`
      );
      setAssignments(data ?? []);
    } catch (err: any) {
      console.error("[onboarding assignments] fetch failed", err);
      setError(err?.message || "Failed to load assignments.");
    }
  }

  const filteredAssignments = assignments;

  const renderSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 w-48 rounded bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );

  const displayName = (empId: string, fallback?: string | null) => {
    const found = employees.find((e) => e.id === empId);
    if (found) {
      const name = `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim();
      return name || found.email || empId;
    }
    return fallback || empId;
  };

  if (orgLoading || !orgSlug) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  const currentPlan = null as Plan | null;

  return (
    <AuthGate>
      <PlanGate required="GROWTH" current={currentPlan}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Onboarding
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Onboarding progress
              </h1>
              <p className="text-sm text-slate-600">
                Track tasks and completion across assigned onboarding templates.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {!isManager && !loading ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have access to onboarding progress.
            </div>
          ) : loading ? (
            renderSkeleton()
          ) : (
            <>
              <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Template
                  </label>
                  <select
                    value={templateFilter}
                    onChange={(e) => setTemplateFilter(e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">All templates</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Employee
                  </label>
                  <select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">All employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                          emp.email ||
                          emp.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => fetchAssignments()}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {filteredAssignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
                  No onboarding assignments found for this filter.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                    <div className="col-span-3">Employee</div>
                    <div className="col-span-3">Template</div>
                    <div className="col-span-2 text-center">Total tasks</div>
                    <div className="col-span-2 text-center">Completed</div>
                    <div className="col-span-2 text-center">Progress</div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {filteredAssignments.map((assn) => {
                      const total = assn.totalTasks ?? 0;
                      const completed = assn.completedTasks ?? 0;
                      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                      return (
                        <div
                          key={assn.id}
                          className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm text-slate-800"
                        >
                          <div className="col-span-3 font-medium">
                            {assn.employeeName ?? displayName(assn.employeeId)}
                          </div>
                          <div className="col-span-3 text-slate-700">
                            {assn.templateName ?? assn.templateId}
                          </div>
                          <div className="col-span-2 text-center">
                            {total}
                          </div>
                          <div className="col-span-2 text-center">
                            {completed}
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-indigo-500 transition-all"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-600">{percent}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PlanGate>
    </AuthGate>
  );
}
