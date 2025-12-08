// src/app/people/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type EmployeeDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  status?: EmployeeStatus | null;
  location?: string | null;
  manager?: { id: string; name: string } | null;
  teams?: { id: string; name: string }[];
};

type TabKey = "overview" | "timeoff" | "onboarding" | "reviews" | "documents";

function statusLabel(status?: EmployeeStatus | null) {
  switch (status) {
    case "ON_LEAVE":
      return "On leave";
    case "CONTRACTOR":
      return "Contractor";
    case "ALUMNI":
      return "Alumni";
    case "INACTIVE":
      return "Inactive";
    case "ACTIVE":
    default:
      return "Active";
  }
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id?: string }>();
  const employeeId = params?.id;
  const router = useRouter();

  const [me, setMe] = useState<CurrentUser | null>(null);
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEmployeeRole = useMemo(() => {
    const role = (me?.role || "").toUpperCase();
    return !["OWNER", "ADMIN", "MANAGER"].includes(role);
  }, [me?.role]);

  // Fetch current user
  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      const user = await getCurrentUser();
      if (!cancelled) setMe(user);
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  // Enforce access and load employee
  useEffect(() => {
    let cancelled = false;
    async function loadEmployee() {
      if (!employeeId) {
        setError("Missing employee id.");
        setLoading(false);
        return;
      }

      // Wait for user
      if (!me) return;

      // Role enforcement: employee can only see self
      if (isEmployeeRole && me.id && me.id !== employeeId) {
        router.replace(`/people/${me.id}`);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await api.get<EmployeeDetail>(`/employees/${employeeId}`);
        if (!cancelled) {
          setEmployee(data ?? null);
          if (!data) setError("Employee not found.");
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[employee detail] fetch failed", err);
          setError(err?.message || "Failed to load employee.");
          setEmployee(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadEmployee();
    return () => {
      cancelled = true;
    };
  }, [employeeId, me, isEmployeeRole, router]);

  const name = `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`.trim() || "Employee";

  return (
    <AuthGate>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/people" className="hover:text-slate-700">
              People
            </Link>
            <span className="text-slate-300">→</span>
            <span className="text-slate-900">{name}</span>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {name}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {employee?.title || "—"} · {employee?.department || "—"}
                  </p>
                  <p className="text-xs text-slate-500">{employee?.email || ""}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-slate-600">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
                  {statusLabel(employee?.status)}
                </span>
                {employee?.manager?.name && (
                  <span>Manager: {employee.manager.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            {(["overview", "timeoff", "onboarding", "reviews", "documents"] as TabKey[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-indigo-600 text-indigo-700"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="h-24 rounded bg-slate-100" />
              </div>
            ) : !employee ? (
              <p className="text-sm text-slate-600">Employee not found.</p>
            ) : (
              <>
                {activeTab === "overview" && (
                  <div className="space-y-3 text-sm text-slate-700">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Contact
                      </h3>
                      <p>{employee.email || "—"}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Manager
                      </h3>
                      <p>{employee.manager?.name || "—"}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Teams
                      </h3>
                      <p>
                        {employee.teams && employee.teams.length > 0
                          ? employee.teams.map((t) => t.name).join(", ")
                          : "—"}
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === "timeoff" && (
                  <p className="text-sm text-slate-600">
                    Time off summary not available in this preview.
                  </p>
                )}
                {activeTab === "onboarding" && (
                  <p className="text-sm text-slate-600">
                    Onboarding tasks not available in this preview.
                  </p>
                )}
                {activeTab === "reviews" && (
                  <p className="text-sm text-slate-600">
                    Performance reviews not available in this preview.
                  </p>
                )}
                {activeTab === "documents" && (
                  <p className="text-sm text-slate-600">
                    Documents not available in this preview.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
