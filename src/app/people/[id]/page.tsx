// src/app/people/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { orgHref } from "@/lib/org-base";


type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type EmployeeDetail = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  department?: string | null;
  status?: EmployeeStatus | null;
  location?: string | null;
  manager?: { id: string; name: string } | null;
  teams?: { id: string; name: string }[];
  employmentType?: string | null;
  startDate?: string | null;
  workLocation?: string | null;
  compensation?: {
    baseSalary?: number | null;
    currency?: string | null;
    paySchedule?: string | null;
    bonusTarget?: string | null;
    equitySummary?: string | null;
  } | null;
  documents?: {
    id: string;
    name?: string | null;
    type?: string | null;
    category?: string | null;
    uploadedAt?: string | null;
    fileName?: string | null;
    url?: string | null;
  }[];
};

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
  const prefName = employee?.preferredName || name;

  const formatCurrency = (value?: number | null, currency?: string | null) => {
    if (value == null) return null;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `$${value.toLocaleString()}`;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  return (
    <AuthGate>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href={orgHref("/people")}
 className="hover:text-slate-700">
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
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-700">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {prefName}
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
                  <span>
                    Manager:{" "}
                    {employee.manager.id ? (
                      <Link
                        href={`/people/${employee.manager.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {employee.manager.name}
                      </Link>
                    ) : (
                      employee.manager.name
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            {/* Left column */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <h2 className="text-sm font-semibold text-slate-900">
                  Personal information
                </h2>
                <p className="text-xs text-slate-500">
                  Basic details and contact information.
                </p>
                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <Field label="Full name" value={name || "—"} />
                  <Field label="Preferred name" value={employee?.preferredName || "—"} />
                  <Field
                    label="Email"
                    value={
                      employee?.email ? (
                        <a
                          className="text-indigo-600 hover:underline"
                          href={`mailto:${employee.email}`}
                        >
                          {employee.email}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <Field
                    label="Phone"
                    value={
                      employee?.phone ? (
                        <a
                          className="text-indigo-600 hover:underline"
                          href={`tel:${employee.phone}`}
                        >
                          {employee.phone}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <Field label="Location" value={employee?.location || employee?.workLocation || "—"} />
                  <Field label="Status" value={statusLabel(employee?.status)} />
                  <Field
                    label="Teams"
                    value={
                      employee?.teams && employee.teams.length > 0
                        ? employee.teams.map((t) => t.name).join(", ")
                        : "—"
                    }
                  />
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <h2 className="text-sm font-semibold text-slate-900">
                  Job details
                </h2>
                <p className="text-xs text-slate-500">
                  Role, reporting, and employment information.
                </p>
                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <Field label="Job title" value={employee?.title || "—"} />
                  <Field label="Department" value={employee?.department || "—"} />
                  <Field
                    label="Manager"
                    value={
                      employee?.manager?.name ? (
                        employee.manager.id ? (
                          <Link
                            href={`/people/${employee.manager.id}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {employee.manager.name}
                          </Link>
                        ) : (
                          employee.manager.name
                        )
                      ) : (
                        "—"
                      )
                    }
                  />
                  <Field label="Employment type" value={employee?.employmentType || "—"} />
                  <Field label="Start date" value={formatDate(employee?.startDate)} />
                  <Field
                    label="Work location"
                    value={employee?.workLocation || employee?.location || "—"}
                  />
                </dl>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <h2 className="text-sm font-semibold text-slate-900">
                  Compensation
                </h2>
                <p className="text-xs text-slate-500">
                  Read-only compensation snapshot.
                </p>
                {employee?.compensation ? (
                  <dl className="mt-4 space-y-2 text-sm text-slate-800">
                    <div className="flex items-center justify-between">
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        Base salary
                      </dt>
                      <dd className="text-sm">
                        {formatCurrency(
                          employee.compensation.baseSalary,
                          employee.compensation.currency
                        ) || "—"}
                        {employee.compensation.paySchedule
                          ? ` / ${employee.compensation.paySchedule.toLowerCase()}`
                          : ""}
                      </dd>
                    </div>
                    {employee.compensation.bonusTarget && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs uppercase tracking-wide text-slate-500">
                          Bonus target
                        </dt>
                        <dd className="text-sm">{employee.compensation.bonusTarget}</dd>
                      </div>
                    )}
                    {employee.compensation.equitySummary && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs uppercase tracking-wide text-slate-500">
                          Equity
                        </dt>
                        <dd className="text-sm">{employee.compensation.equitySummary}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                    Compensation details are not available for this employee. {/* TODO: bind when API provides */}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <h2 className="text-sm font-semibold text-slate-900">Documents</h2>
                <p className="text-xs text-slate-500">
                  Key documents like tax forms and offer letters.
                </p>

                {employee?.documents && employee.documents.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {employee.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                      >
                        <div>
                          <div className="font-medium text-slate-800">
                            {doc.name || doc.fileName || "Document"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {(doc.type || doc.category || "File")} · Uploaded{" "}
                            {formatDate(doc.uploadedAt)}
                          </div>
                        </div>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                    No documents on file for this employee. {/* TODO: bind when API provides */}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && !employee && (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-24 rounded bg-slate-100" />
            </div>
          )}
        </div>
      </main>
    </AuthGate>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}
