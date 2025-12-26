// src/app/employees/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { orgHref } from "@/lib/org-base";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus | null;
};

function formatStatus(status?: EmployeeStatus | null) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "ON_LEAVE":
      return "On leave";
    case "CONTRACTOR":
      return "Contractor";
    case "ALUMNI":
      return "Alumni";
    default:
      return "Active";
  }
}

export default function EmployeesPage() {
  return <EmployeesClient />;
}

function EmployeesClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = (await api.get<Employee[]>("/employees")) ?? [];
        if (active) setEmployees(res);
      } catch (err) {
        console.error("Failed to load employees", err);
        if (active) setEmployees([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  // Normalize all departments to strings (no nulls)
  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          employees
            .map((e) => e.department ?? "")
            .filter((d) => d.length > 0)
        )
      ).sort(),
    [employees]
  );

  // Normalize locations
  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          employees.map((e) => e.location ?? "").filter((l) => l.length > 0)
        )
      ).sort(),
    [employees]
  );

  // Normalize statuses (NO nulls allowed)
  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          employees
            .map((e) => e.status ?? "ACTIVE") // default fallback
            .filter(Boolean)
        )
      ).sort(),
    [employees]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees
      .filter((e) => {
        const dept = e.department ?? "";
        const loc = e.location ?? "";
        const stat = e.status ?? "ACTIVE";

        if (selectedDepartment !== "ALL" && dept !== selectedDepartment)
          return false;
        if (selectedLocation !== "ALL" && loc !== selectedLocation)
          return false;
        if (selectedStatus !== "ALL" && stat !== selectedStatus) return false;

        if (query) {
          const full = `${e.firstName ?? ""} ${e.lastName ?? ""}`.toLowerCase();
          const email = (e.email || "").toLowerCase();
          if (!full.includes(query) && !email.includes(query)) return false;
        }

        return true;
      })
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
  }, [
    employees,
    search,
    selectedDepartment,
    selectedLocation,
    selectedStatus,
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search and filter everyone in the organization.
          </p>
        </div>
        <Link
          href={orgHref("/people/new")}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
        >
          Add employee
        </Link>
      </header>

      {/* FILTERS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-700">
        <div className="grid gap-3 sm:grid-cols-4">
          {/* SEARCH */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* DEPARTMENT */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* LOCATION */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500">
            Showing {filtered.length} of {employees.length} employees
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedDepartment("ALL");
              setSelectedLocation("ALL");
              setSelectedStatus("ALL");
            }}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            No employees found. Try adjusting filters or add someone new.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/people/${e.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {e.firstName} {e.lastName}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        {e.email ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2">{e.title ?? "—"}</td>
                    <td className="px-4 py-2">{e.department ?? "—"}</td>
                    <td className="px-4 py-2">{e.location ?? "—"}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                        {formatStatus(e.status ?? "ACTIVE")}
                      </span>
                    </td>
                  </tr>           
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
