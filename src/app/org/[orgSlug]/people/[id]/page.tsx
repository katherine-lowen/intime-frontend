"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User } from "lucide-react";
import { listMyCertificates } from "@/lib/learning-api";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  department?: string | null;
  teamName?: string | null;
  location?: string | null;
  status?: string | null;
  employmentType?: string | null;
  startDate?: string | null;
  managerName?: string | null;
  avatarUrl?: string | null;
};

export default function EmployeeProfilePage() {
  const params = useParams<{ orgSlug: string; id: string }>();
  const { activeOrg, isLoading: authLoading } = useAuth();

  const orgSlug = params?.orgSlug ?? "demo-org";
  const employeeId = params?.id;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [comp, setComp] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      if (!employeeId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<Employee>(
          `/org/${orgSlug}/people/${employeeId}`
        );
        setEmployee(res ?? null);
      } catch (err: any) {
        console.error("Failed to load employee", err);
        const status = err?.response?.status;
        if (status === 403 || status === 404) {
          setError("unauthorized");
        } else {
          setError("Unable to load this employee right now.");
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
    async function loadCertificates() {
      try {
        const res = await listMyCertificates(orgSlug);
        setCertificates(res || []);
      } catch {
        // ignore if not enabled
      }
    }
    void loadCertificates();
    async function loadComp() {
      try {
        const res = await api.get<any>(
          `/org/${orgSlug}/payroll/comp/${employeeId}`
        );
        setComp(res || null);
      } catch {
        // ignore
      }
    }
    void loadComp();
  }, [employeeId, orgSlug]);

  const initials = useMemo(() => {
    if (!employee) return "NA";
    const first = employee.firstName?.[0] ?? "";
    const last = employee.lastName?.[0] ?? "";
    const combined = `${first}${last}`.trim();
    return combined || (employee.email?.[0] ?? "U");
  }, [employee]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error === "unauthorized" || (!employee && !loading && error)) {
    return (
      <Unauthorized
        roleLabel="authorized viewers"
        fallbackHref={`/org/${orgSlug}/people`}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Employee not found.
      </div>
    );
  }

  const statusLabel = (employee.status || "ACTIVE").toLowerCase();

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            {employee.avatarUrl ? (
              <AvatarImage
                src={employee.avatarUrl}
                alt={employee.firstName}
              />
            ) : (
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {initials.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm text-slate-600">
              {employee.title ?? "—"}{" "}
              {employee.department ? `· ${employee.department}` : ""}
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {employee.teamName && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Team: {employee.teamName}
                </span>
              )}
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                {statusLabel}
              </span>
              {employee.startDate && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Start:{" "}
                  {new Date(employee.startDate).toLocaleDateString()}
                </span>
              )}
              {employee.location && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {employee.location}
                </span>
              )}
            </div>

            {employee.managerName && (
              <p className="text-xs text-slate-500">
                Manager: {employee.managerName}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Details */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Job details</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <InfoRow label="Title" value={employee.title} />
            <InfoRow label="Department" value={employee.department} />
            <InfoRow label="Employment type" value={employee.employmentType} />
            <InfoRow label="Team" value={employee.teamName} />
            <InfoRow label="Location" value={employee.location} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <InfoRow label="Email" value={employee.email} />
            <InfoRow label="Phone" value={employee.phone} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Learning & Certifications</h2>
          {certificates.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No certificates yet.</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {certificates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.courseTitle || "Course"}</p>
                    <p className="text-xs text-slate-500">
                      Issued: {c.issuedAt || "—"} · v{c.courseVersion ?? "—"}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Link className="text-indigo-700 hover:underline" href={`/org/${orgSlug}/learning/certificates/${c.id}`}>
                      View
                    </Link>
                    <Link className="text-slate-600 hover:underline" href={`/org/${orgSlug}/learning/certificates/${c.id}`}>
                      Share
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Compensation</h2>
          {comp ? (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <InfoRow label="Type" value={comp.type || "—"} />
              <InfoRow label="Amount" value={comp.amount ? `$${comp.amount}` : "—"} />
              <InfoRow label="Currency" value={comp.currency || "USD"} />
              <InfoRow label="Schedule" value={comp.schedule || "—"} />
              <InfoRow label="Last sync" value={comp.syncedAt || "—"} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No compensation data.</p>
          )}
        </div>
      </div>

      {/* Action cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <PlaceholderCard title="Compensation" />

        <LinkCard
          title="Documents"
          description="View and upload employee documents"
          href={`/org/${orgSlug}/people/${employeeId}/documents`}
        />

        <LinkCard
          title="Reviews"
          description="Open reviews and performance history"
          href={`/org/${orgSlug}/performance/reviews?employeeId=${encodeURIComponent(
            employeeId ?? ""
          )}`}
        />

        <LinkCard
          title="Request comp change"
          description="Submit a compensation change for approval"
          href={`/org/${orgSlug}/payroll/comp-changes?employeeId=${encodeURIComponent(
            employeeId ?? ""
          )}`}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm text-slate-900">{value || "—"}</span>
    </div>
  );
}

function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
      <div className="flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <User className="h-5 w-5" />
        </div>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500">Coming soon</p>
    </div>
  );
}

function LinkCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
    >
      <div className="flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-slate-200">
          <User className="h-5 w-5" />
        </div>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
      <p className="mt-3 text-xs font-semibold text-indigo-700">Open →</p>
    </Link>
  );
}
