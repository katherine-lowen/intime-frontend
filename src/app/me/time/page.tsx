// src/app/me/time/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import EmployeeTimeOffPanel from "@/components/employee-timeoff-panel";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import { orgHref } from "@/lib/org-base";


type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI" | null;

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  status?: EmployeeStatus;
};

export default function MyTimePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMe() {
      try {
        setLoading(true);
        setError(null);

        // For now we don't have auth, so treat the first ACTIVE employee as "me"
        const all = (await api.get<Employee[]>("/employees")) ?? [];

        const active =
          all.find((e) => e.status === "ACTIVE") ??
          all[0] ??
          null;

        if (!active) {
          setError("No employees found in this org yet.");
        }

        setEmployee(active);
      } catch (err) {
        console.error(err);
        setError("Failed to load your profile.");
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    }

    void loadMe();
  }, []);

  return (
    <AuthGate>
      {loading ? (
        <main className="p-6">
          <p className="text-sm text-slate-600">Loading your time off…</p>
        </main>
      ) : error || !employee ? (
        <main className="space-y-3 p-6">
          <h1 className="text-2xl font-semibold tracking-tight">My time</h1>
          <p className="text-sm text-red-600">
            {error ?? "Unable to determine current employee."}
          </p>
          <p className="text-xs text-slate-500">
            Make sure you have at least one employee in{" "}
            <Link href={orgHref("/people")}
 className="text-indigo-600 hover:underline">
              People
            </Link>
            .
          </p>
        </main>
      ) : (
        <main className="space-y-6 p-6">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">My time</h1>
              <p className="text-sm text-slate-600">
                {`${employee.firstName} ${employee.lastName}`}
                {(() => {
                  const subtitleParts: string[] = [];
                  if (employee.title) subtitleParts.push(employee.title);
                  if (employee.department) subtitleParts.push(employee.department);
                  const subtitle = subtitleParts.join(" • ");
                  return subtitle ? ` — ${subtitle}` : "";
                })()}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-xs">
              <Link
                href={`/people/${employee.id}`}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                View full profile
              </Link>
            </div>
          </header>

          {/* Time off panel reused here */}
          <div className="max-w-3xl">
            <EmployeeTimeOffPanel employeeId={employee.id} />
          </div>
        </main>
      )}
    </AuthGate>
  );
}
