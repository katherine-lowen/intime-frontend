// src/app/payroll/page.tsx
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type PayrollRow = {
  employeeId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  department: string | null;
  title: string | null;
  location: string | null;
  status: string | null;
  startDate: string | null;
  payType: string | null;
  basePayCents: number | null;
  payCurrency: string | null;
  paySchedule: string | null;
  payrollProvider: string | null;
  payrollExternalId: string | null;
};

async function getPayrollExport(): Promise<PayrollRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

  const res = await fetch(`${baseUrl}/payroll/export`, {
    headers: {
      "x-org-id": orgId,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Failed to load payroll export", res.status, text);
    throw new Error(`Failed to load payroll export: ${res.status}`);
  }

  return (await res.json()) as PayrollRow[];
}

function formatMoney(cents: number | null | undefined, currency: string | null | undefined) {
  if (!cents && cents !== 0) return "—";
  const value = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency || "USD"}`;
  }
}

function compactPayType(type: string | null | undefined) {
  if (!type) return "—";
  switch (type) {
    case "SALARY":
      return "Salary";
    case "HOURLY":
      return "Hourly";
    case "CONTRACTOR":
      return "Contractor";
    default:
      return type;
  }
}

function compactSchedule(schedule: string | null | undefined) {
  if (!schedule) return "—";
  switch (schedule) {
    case "WEEKLY":
      return "Weekly";
    case "BIWEEKLY":
      return "Bi-weekly";
    case "SEMI_MONTHLY":
      return "Semi-monthly";
    case "MONTHLY":
      return "Monthly";
    case "OTHER":
      return "Other";
    default:
      return schedule;
  }
}

function compactProvider(provider: string | null | undefined) {
  if (!provider || provider === "NONE") return "Not connected";
  switch (provider) {
    case "GUSTO":
      return "Gusto";
    case "ADP":
      return "ADP";
    case "RIPPLING":
      return "Rippling";
    case "DEEL":
      return "Deel";
    case "OTHER":
      return "Other provider";
    default:
      return provider;
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

async function downloadCsv() {
  // This function is only used client-side via <form>, but TS needs it here.
}

export default async function PayrollPage() {
  let rows: PayrollRow[] = [];
  let error: string | null = null;

  try {
    rows = await getPayrollExport();
  } catch (e: any) {
    error = e?.message || "Failed to load payroll export.";
  }

  const activeCount = rows.length;
  const withProvider = rows.filter((r) => r.payrollProvider && r.payrollProvider !== "NONE").length;
  const withComp = rows.filter((r) => r.basePayCents != null).length;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";
  const csvUrl = `${baseUrl}/payroll/export`; // same endpoint; CSV can come later

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Platform</span>
              <span className="text-slate-500">/</span>
              <span>Payroll</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Payroll export
            </h1>
            <p className="text-sm text-slate-600">
              A clean export of active employees, compensation, and identifiers
              for Gusto, ADP, Rippling, or your provider of choice.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <Link
              href="/settings#payroll"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Open payroll settings
            </Link>
            <form
              action={csvUrl}
              method="GET"
              className="inline-flex"
            >
              <input type="hidden" name="orgId" value={orgId} />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Export latest CSV
              </button>
            </form>
          </div>
        </header>

        {/* STATS */}
        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Active employees in export"
            value={activeCount}
            helper="Based on Employee status = ACTIVE"
          />
          <StatCard
            label="With compensation set"
            value={withComp}
            helper="Using base pay and pay type"
          />
          <StatCard
            label="With payroll provider linked"
            value={withProvider}
            helper="Using payroll provider + external ID"
          />
        </section>

        {/* TABLE */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Payroll export preview
              </h2>
              <p className="text-xs text-slate-500">
                This is the same data your provider will receive in the export file.
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              {rows.length} rows
            </span>
          </div>

          {error ? (
            <div className="px-4 py-4 text-sm text-red-600">{error}</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              No active employees found for this organization yet. Once you add people
              and set compensation on their profiles, they&apos;ll show up here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="border-b bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Employee</th>
                    <th className="px-3 py-2 text-left">Department</th>
                    <th className="px-3 py-2 text-left">Base pay</th>
                    <th className="px-3 py-2 text-left">Pay type</th>
                    <th className="px-3 py-2 text-left">Schedule</th>
                    <th className="px-3 py-2 text-left">Provider</th>
                    <th className="px-3 py-2 text-left">Start date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => {
                    const name = [row.firstName, row.lastName]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <tr key={row.employeeId} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2">
                          <div className="text-xs font-medium text-slate-900">
                            {name || row.email || "Employee"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {row.title || "—"}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {row.department || "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-900">
                          {formatMoney(row.basePayCents, row.payCurrency)}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {compactPayType(row.payType)}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {compactSchedule(row.paySchedule)}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {compactProvider(row.payrollProvider)}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {formatDate(row.startDate)}
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
    </AuthGate>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}
