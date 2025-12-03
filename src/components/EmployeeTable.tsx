// src/components/EmployeeTable.tsx
import React from "react";

export type EmployeeTableStatus = "Active" | "On leave" | "Contractor" | "Alumni";

export type EmployeeTableEmployee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  status: EmployeeTableStatus;
};

type EmployeeTableProps = {
  employees: EmployeeTableEmployee[];
};

const statusBadgeClasses: Record<EmployeeTableStatus, string> = {
  Active:
    "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "On leave":
    "bg-amber-50 text-amber-700 border border-amber-100",
  Contractor:
    "bg-sky-50 text-sky-700 border border-sky-100",
  Alumni:
    "bg-slate-100 text-slate-600 border border-slate-200",
};

export function EmployeeTable({ employees }: EmployeeTableProps) {
  if (!employees || employees.length === 0) {
    return (
      <div className="px-8 py-12 text-sm text-gray-600 text-center">
        <p>No employees yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gray-50/80 border-b border-gray-200/80">
          <tr className="text-xs uppercase tracking-[0.14em] text-gray-500">
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Role</th>
            <th className="px-6 py-3 text-left">Department</th>
            <th className="px-6 py-3 text-left">Location</th>
            <th className="px-6 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className="hover:bg-gray-50/70 transition-colors"
            >
              {/* Name + email */}
              <td className="px-6 py-3 align-top">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {employee.name || "Unnamed"}
                  </span>
                  {employee.email && (
                    <span className="text-xs text-gray-500">
                      {employee.email}
                    </span>
                  )}
                </div>
              </td>

              {/* Role */}
              <td className="px-6 py-3 align-top text-sm text-gray-700">
                {employee.role || "—"}
              </td>

              {/* Department */}
              <td className="px-6 py-3 align-top text-sm text-gray-700">
                {employee.department || "—"}
              </td>

              {/* Location */}
              <td className="px-6 py-3 align-top text-sm text-gray-700">
                {employee.location || "—"}
              </td>

              {/* Status pill */}
              <td className="px-6 py-3 align-top">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    statusBadgeClasses[employee.status] ||
                    statusBadgeClasses["Active"]
                  }`}
                >
                  {employee.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
