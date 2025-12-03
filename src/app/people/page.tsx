// src/app/people/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { UserPlus } from "lucide-react";
import { FilterPill } from "@/components/FilterPill";
import { EmployeeTable } from "@/components/EmployeeTable";

export const dynamic = "force-dynamic";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type Employee = {
  employeeId?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus | null;
};

type UIEmployeeStatus = "Active" | "On leave" | "Contractor" | "Alumni";

type UIEmployee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  status: UIEmployeeStatus;
};

async function getEmployees(): Promise<Employee[]> {
  return api.get<Employee[]>("/employees");
}

// Normalize IDs (same logic as before so it stays compatible with /people/[id])
function getCanonicalId(e: Employee): string | null {
  const clean = (v?: string) =>
    v && v !== "undefined" && v.trim() !== "" ? v : null;

  return clean(e.employeeId) ?? clean(e.id) ?? null;
}

function mapStatusToUI(status?: EmployeeStatus | null): UIEmployeeStatus {
  switch (status) {
    case "ON_LEAVE":
      return "On leave";
    case "CONTRACTOR":
      return "Contractor";
    case "ALUMNI":
      return "Alumni";
    case "ACTIVE":
    default:
      return "Active";
  }
}

export default async function PeoplePage() {
  let employees: Employee[] = [];
  let loadError: string | null = null;

  try {
    employees = await getEmployees();
  } catch (err) {
    console.error("[PeoplePage] Failed to load /employees", err);
    loadError = "We couldn’t load your people data just now.";
  }

  // Derived values
  const total = employees.length;
  const totalActive = employees.filter(
    (e) => (e.status || "ACTIVE") === "ACTIVE",
  ).length;

  const departments = Array.from(
    new Set(
      employees
        .map((e) => (e.department || "").trim())
        .filter((d) => d.length > 0),
    ),
  ).sort();

  // Adapt backend employees -> Figma table shape
  const uiEmployees: UIEmployee[] = employees.map((e, index) => {
    const canonicalId = getCanonicalId(e);
    const name = `${e.firstName} ${e.lastName}`.trim() || "Unnamed";

    return {
      id:
        canonicalId ||
        e.id ||
        e.employeeId ||
        `row-${index}`, // fallback just for React keys / table
      name,
      email: e.email || "",
      role: e.title || "",
      department: e.department || "",
      location: e.location || "",
      status: mapStatusToUI(e.status),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="max-w-[1400px] mx-auto px-10 py-12">
        {/* Error banner (if any) */}
        {loadError && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {loadError} We&apos;re showing an empty directory instead.
          </div>
        )}

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-gray-900 mb-3">Directory</h1>
          <p className="text-gray-600 max-w-2xl">
            Everyone in your Intime workspace, across teams and locations.
          </p>
        </div>

        {/* Filters and Actions Bar */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <FilterPill label="Active headcount" count={totalActive} active />
            <FilterPill label="Departments" />

            {/* Show first few departments as pills */}
            {departments.map((dept) => (
              <FilterPill key={dept} label={dept} active />
            ))}
          </div>

          <div className="flex items-center gap-5">
            <div className="text-sm text-gray-600 font-medium">
              <span className="text-gray-900">{total}</span> total{" "}
              <span className="text-gray-400 mx-1">•</span>
              <span className="text-gray-900">{totalActive}</span> active
            </div>

            <Link
              href="/people/new"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#2C6DF9] text-white rounded-xl hover:bg-[#2459d6] transition-all duration-200 shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 font-medium"
            >
              <UserPlus className="w-4.5 h-4.5" strokeWidth={2.5} />
              New employee
            </Link>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[20px] shadow-lg shadow-gray-200/50 border border-gray-200/60 overflow-hidden">
          {uiEmployees.length === 0 ? (
            <div className="px-8 py-12 text-sm text-gray-600 text-center">
              <p>No employees yet.</p>
              <p className="mt-2">
                Get started by{" "}
                <Link
                  href="/people/new"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  creating your first employee
                </Link>
                .
              </p>
            </div>
          ) : (
            <EmployeeTable employees={uiEmployees} />
          )}
        </div>
      </div>
    </div>
  );
}
