// src/app/timeoff/page.tsx
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type TimeOffPolicyKind = "UNLIMITED" | "FIXED";

type TimeOffStatus = "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";

type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

type EmployeeLite = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string | null;
  timeOffPolicy?: {
    id: string;
    name: string;
    kind: TimeOffPolicyKind;
    annualAllowanceDays?: number | null;
  } | null;
};

type ManagerLite = {
  id: string;
  firstName: string;
  lastName: string;
} | null;

type PolicyLite = {
  id: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays?: number | null;
} | null;

type TimeOffRequest = {
  id: string;
  orgId: string;
  employeeId: string;
  policyId?: string | null;
  type: TimeOffType;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  reason?: string | null;
  managerId?: string | null;
  employee: EmployeeLite;
  manager: ManagerLite;
  policy: PolicyLite;
};

async function getTimeOffRequests(): Promise<TimeOffRequest[]> {
  try {
    const data = await api.get<TimeOffRequest[]>("/timeoff/requests");
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    console.error(
      "Failed to load time off requests, showing empty state",
      err
    );
    return [];
  }
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);

  const sValid = !Number.isNaN(s.getTime());
  const eValid = !Number.isNaN(e.getTime());

  if (!sValid || !eValid) return "Dates not set";

  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();

  const startLabel = s.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endLabel = e.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

function statusBadgeClasses(status: TimeOffStatus) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "DENIED":
      return "bg-red-50 text-red-700 border-red-200";
    case "CANCELLED":
      return "bg-slate-50 text-slate-500 border-slate-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default async function TimeOffPage() {
  const requests = await getTimeOffRequests();

  const total = requests.length;
  const byStatus: Record<TimeOffStatus, TimeOffRequest[]> = {
    REQUESTED: [],
    APPROVED: [],
    DENIED: [],
    CANCELLED: [],
  };

  for (const r of requests) {
    byStatus[r.status]?.push(r);
  }

  const approvedThisYear = byStatus.APPROVED.length;
  const pending = byStatus.REQUESTED.length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Time off
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            PTO policies & requests
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            See who&apos;s out, how much time is being used, and what&apos;s
            waiting for approval.
          </p>
        </div>
      </section>

      {/* Snapshot cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total requests</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{total}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            All time off records in Intime
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Pending approval</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {pending}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Requests in <span className="font-medium">REQUESTED</span> status
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Approved (all time)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {approvedThisYear}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Requests in <span className="font-medium">APPROVED</span> status
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            All time off requests
          </h2>
          <p className="text-[11px] text-slate-500">
            Pulled from <code className="font-mono text-[10px]">/timeoff/requests</code>
          </p>
        </div>

        {requests.length === 0 ? (
          <p className="text-sm text-slate-500">
            No time off requests recorded yet. As employees start requesting PTO
            or sick time, they&apos;ll show up here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Dates</th>
                  <th className="py-2 pr-4">Policy</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Manager</th>
                  <th className="py-2 pr-4">Reason</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const emp = r.employee;
                  const manager = r.manager;
                  const policy = r.policy ?? emp.timeOffPolicy ?? null;

                  const employeeName = emp
                    ? `${emp.firstName} ${emp.lastName}`.trim()
                    : "Unknown";

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-50 text-xs text-slate-700"
                    >
                      <td className="py-2 pr-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{employeeName}</span>
                          <span className="text-[11px] text-slate-500">
                            {emp?.department || emp?.email || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px]">
                          {r.type}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {formatDateRange(r.startDate, r.endDate)}
                      </td>
                      <td className="py-2 pr-4">
                        {policy ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">
                              {policy.name}
                            </span>
                            {policy.kind === "FIXED" &&
                              typeof policy.annualAllowanceDays === "number" && (
                                <span className="text-[11px] text-slate-500">
                                  {policy.annualAllowanceDays} days / year
                                </span>
                              )}
                            {policy.kind === "UNLIMITED" && (
                              <span className="text-[11px] text-slate-500">
                                Unlimited PTO
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={
                            "inline-flex rounded-full border px-2 py-0.5 text-[11px] " +
                            statusBadgeClasses(r.status)
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {manager ? (
                          <span className="text-xs">
                            {manager.firstName} {manager.lastName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 max-w-xs">
                        <span className="line-clamp-2 text-xs text-slate-600">
                          {r.reason || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
