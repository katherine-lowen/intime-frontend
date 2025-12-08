// src/app/people/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type EmployeeListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  status?: EmployeeStatus | null;
  manager?: { id: string; name: string } | null;
  teams?: { id: string; name: string }[];
};

type EmployeesResponse = {
  items: EmployeeListItem[];
  page: number;
  pageSize: number;
  total: number;
};

type SortKey = "name" | "department";

const PAGE_SIZE = 25;

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

export default function PeoplePage() {
  const router = useRouter();
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | "" >("");
  const [sort, setSort] = useState<SortKey>("name");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmployeeRole = useMemo(() => {
    const role = (me?.role || "").toUpperCase();
    return !["OWNER", "ADMIN", "MANAGER"].includes(role);
  }, [me?.role]);

  // Load current user
  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      setLoadingUser(true);
      const user = await getCurrentUser();
      if (!cancelled) {
        setMe(user);
        setLoadingUser(false);
      }
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch employees with filters/pagination
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (loadingUser) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(PAGE_SIZE));
        if (search.trim()) params.set("search", search.trim());
        if (department) params.set("department", department);
        if (status) params.set("status", status);
        const data = await api.get<EmployeesResponse>(`/employees?${params.toString()}`);
        if (cancelled || !data) return;
        let items = data.items ?? [];
        // Employee role: only show self
        if (isEmployeeRole && me?.id) {
          items = items.filter((e) => e.id === me.id);
        }
        // Sort client-side for now
        items = [...items].sort((a, b) => {
          if (sort === "name") {
            const an = `${a.firstName ?? ""} ${a.lastName ?? ""}`.toLowerCase();
            const bn = `${b.firstName ?? ""} ${b.lastName ?? ""}`.toLowerCase();
            return an.localeCompare(bn);
          }
          if (sort === "department") {
            return (a.department || "").localeCompare(b.department || "");
          }
          return 0;
        });
        setEmployees(items);
        setTotal(data.total ?? items.length);
      } catch (err: any) {
        if (!cancelled) {
          console.error("[people] fetch failed", err);
          setError(err?.message || "Failed to load employees.");
          setEmployees([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [page, search, department, status, sort, isEmployeeRole, me?.id, loadingUser]);

  const departments = useMemo(
    () =>
      Array.from(new Set(employees.map((e) => e.department || "").filter(Boolean))).sort(),
    [employees]
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleRowClick = (id: string) => {
    router.push(`/people/${id}`);
  };

  return (
    <AuthGate>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">People</p>
              <h1 className="text-2xl font-semibold text-slate-900">Directory</h1>
              <p className="text-sm text-slate-600">
                Everyone in your workspace, across teams and locations.
              </p>
            </div>
            {!isEmployeeRole && (
              <Link
                href="/people/new"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                + New employee
              </Link>
            )}
          </header>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {/* Filters */}
          {!isEmployeeRole && (
            <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search by name or email"
                className="w-64 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={department}
                onChange={(e) => {
                  setPage(1);
                  setDepartment(e.target.value);
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value as EmployeeStatus | "");
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On leave</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="ALUMNI">Alumni</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="name">Sort by name</option>
                <option value="department">Sort by department</option>
              </select>
            </div>
          )}

          {/* Table / list */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Title</div>
              <div className="col-span-2">Department</div>
              <div className="col-span-2">Manager</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Teams</div>
            </div>

            {loading ? (
              <div className="space-y-2 px-4 py-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No employees found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {employees.map((e) => {
                  const name = `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || "Unnamed";
                  return (
                    <button
                      key={e.id}
                      onClick={() => handleRowClick(e.id)}
                      className="grid w-full grid-cols-12 items-center gap-4 px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700">
                            {name ? name.slice(0, 2).toUpperCase() : "EE"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{name}</span>
                            <span className="text-[11px] text-slate-500">{e.email || ""}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-slate-700">{e.title || "—"}</div>
                      <div className="col-span-2 text-sm text-slate-700">{e.department || "—"}</div>
                      <div className="col-span-2 text-sm text-slate-700">
                        {e.manager?.name || "—"}
                      </div>
                      <div className="col-span-2 text-xs">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {statusLabel(e.status)}
                        </span>
                      </div>
                      <div className="col-span-1 text-right text-xs text-slate-500">
                        {e.teams?.length ?? 0}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pagination */}
          {!loading && employees.length > 0 && (
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Page {page} of {totalPages} · {total} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGate>
  );
}
