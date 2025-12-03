// src/app/payroll/page.tsx
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import {
  Download,
  Settings,
  Users,
  DollarSign,
  Link2,
  Calendar,
  Shield,
  Sparkles,
  FileText,
  TrendingUp,
  Building2,
  Zap,
} from "lucide-react";

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

  if (res.status === 404) {
    console.warn("Payroll export endpoint returned 404 – treating as empty.");
    return [];
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Failed to load payroll export", res.status, text);
    throw new Error(`Failed to load payroll export: ${res.status}`);
  }

  return (await res.json()) as PayrollRow[];
}

function formatMoney(
  cents: number | null | undefined,
  currency: string | null | undefined,
) {
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

export default async function PayrollPage() {
  let rows: PayrollRow[] = [];
  let error: string | null = null;

  try {
    rows = await getPayrollExport();
  } catch (e: any) {
    error = e?.message || "Failed to load payroll export.";
  }

  const activeCount = rows.length;
  const withProvider = rows.filter(
    (r) => r.payrollProvider && r.payrollProvider !== "NONE",
  ).length;
  const withComp = rows.filter((r) => r.basePayCents != null).length;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";
  const csvUrl = `${baseUrl}/payroll/export`;

  return (
    <AuthGate>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="mx-auto max-w-[1400px] px-8 py-8 space-y-6">
          {/* ERROR BANNER */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* HEADER */}
          <section className="mb-2 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Platform</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-slate-700">Payroll</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Payroll
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                    Unified compensation, identifiers, and export tools for
                    Gusto, ADP, Rippling, and custom payroll providers.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
                  <div className="flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-emerald-700">Live workspace</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">Last updated: just now</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/settings#payroll"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4" />
                    Payroll settings
                  </Link>

                  <form action={csvUrl} method="GET" className="inline-flex">
                    <input type="hidden" name="orgId" value={orgId} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      <Download className="h-4 w-4" />
                      Export latest CSV
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* METRIC CARDS */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={<Users className="h-5 w-5 text-white" />}
              iconBg="bg-blue-500"
              iconShadow="shadow-blue-500/25"
              label="Active employees in export"
              value={String(activeCount)}
              footer="Based on Employee status = ACTIVE"
            />
            <MetricCard
              icon={<DollarSign className="h-5 w-5 text-white" />}
              iconBg="bg-emerald-500"
              iconShadow="shadow-emerald-500/25"
              label="With compensation set"
              value={String(withComp)}
              footer="Using base pay and pay type"
            />
            <MetricCard
              icon={<Link2 className="h-5 w-5 text-white" />}
              iconBg="bg-purple-500"
              iconShadow="shadow-purple-500/25"
              label="With payroll provider linked"
              value={String(withProvider)}
              footer="Using provider + external ID"
            />
            <MetricCard
              icon={<Calendar className="h-5 w-5 text-white" />}
              iconBg="bg-orange-500"
              iconShadow="shadow-orange-500/25"
              label="Upcoming pay dates"
              value="—"
              footer="Detects next pay cycle for your org"
              comingSoon
            />
          </section>

          {/* AUTOMATION STATUS */}
          <AutomationStatusCard />

          {/* PAYROLL EXPORT PREVIEW */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Payroll export preview
                </h2>
                <p className="text-xs text-slate-500">
                  This is the same data your provider will receive in the export
                  file.
                </p>
              </div>
              <span className="text-[11px] text-slate-500">
                {rows.length} rows
              </span>
            </div>

            {error ? (
              <div className="px-6 py-6 text-sm text-red-600">{error}</div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 shadow-inner">
                  <FileText className="h-7 w-7 text-indigo-500" />
                </div>
                <h3 className="mb-1 text-sm font-medium text-slate-900">
                  No payroll data to preview
                </h3>
                <p className="text-xs text-slate-500">
                  Configure employee compensation and link payroll providers to
                  see your export preview here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="border-b bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Employee</th>
                      <th className="px-4 py-2 text-left">Department</th>
                      <th className="px-4 py-2 text-left">Base pay</th>
                      <th className="px-4 py-2 text-left">Pay type</th>
                      <th className="px-4 py-2 text-left">Schedule</th>
                      <th className="px-4 py-2 text-left">Provider</th>
                      <th className="px-4 py-2 text-left">Start date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => {
                      const name = [row.firstName, row.lastName]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <tr
                          key={row.employeeId}
                          className="hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-2">
                            <div className="text-xs font-medium text-slate-900">
                              {name || row.email || "Employee"}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {row.title || "—"}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {row.department || "—"}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-900">
                            {formatMoney(row.basePayCents, row.payCurrency)}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {compactPayType(row.payType)}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {compactSchedule(row.paySchedule)}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {compactProvider(row.payrollProvider)}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
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

          {/* AI COMPENSATION INSIGHTS */}
          <AICompInsightsSection />

          {/* UPCOMING FEATURES */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-slate-900">
                Upcoming Features
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ComingSoonFeatureCard
                icon={<Calendar className="h-5 w-5 text-white" />}
                title="Payroll Runs"
                description="Process payroll cycles, validate, and transmit securely."
                gradientFrom="from-blue-500"
                gradientTo="to-cyan-500"
              />
              <ComingSoonFeatureCard
                icon={<Shield className="h-5 w-5 text-white" />}
                title="Taxes & Deductions"
                description="Automatic calculation and compliance for all employee types."
                gradientFrom="from-emerald-500"
                gradientTo="to-teal-500"
              />
              <ComingSoonFeatureCard
                icon={<DollarSign className="h-5 w-5 text-white" />}
                title="Direct Deposit & Banking"
                description="Manage routing, deposits, and payout reconciliation."
                gradientFrom="from-purple-500"
                gradientTo="to-pink-500"
              />
              <ComingSoonFeatureCard
                icon={<TrendingUp className="h-5 w-5 text-white" />}
                title="Compensation Bands"
                description="Structure pay ranges by role, level, and region."
                gradientFrom="from-orange-500"
                gradientTo="to-red-500"
              />
              <ComingSoonFeatureCard
                icon={<FileText className="h-5 w-5 text-white" />}
                title="ACA Reporting"
                description="Generate healthcare compliance forms and audits."
                gradientFrom="from-indigo-500"
                gradientTo="to-violet-500"
              />
              <ComingSoonFeatureCard
                icon={<Building2 className="h-5 w-5 text-white" />}
                title="Payroll Integrations Hub"
                description="Connect Gusto, ADP, Justworks, Rippling, Paychex."
                gradientFrom="from-slate-600"
                gradientTo="to-slate-500"
              />
            </div>
          </section>
        </div>
      </main>
    </AuthGate>
  );
}

/* ---------- INTERNAL UI PIECES (Figma-inspired) ---------- */

type MetricCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  iconShadow: string;
  label: string;
  value: string;
  footer: string;
  comingSoon?: boolean;
};

function MetricCard({
  icon,
  iconBg,
  iconShadow,
  label,
  value,
  footer,
  comingSoon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="text-2xl font-semibold text-slate-900">{value}</div>
          <p className="text-[11px] text-slate-500">{footer}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconShadow} text-white`}
        >
          {icon}
        </div>
      </div>
      {comingSoon && (
        <div className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          Coming soon
        </div>
      )}
    </div>
  );
}

function AutomationStatusCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-800/30">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Automation status
            </div>
            <p className="text-xs text-slate-500">
              Payroll auto-sync with providers, approvals, and anomaly checks.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Coming soon
        </div>
      </div>
    </section>
  );
}

function AICompInsightsSection() {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-violet-500/90 via-indigo-500/90 to-sky-500/90 p-[1px] shadow-md">
      <div className="rounded-[22px] bg-gradient-to-r from-violet-50/95 via-indigo-50/95 to-sky-50/95 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-medium text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI Compensation Insights
              <span className="rounded-full bg-violet-700 px-2 py-0.5 text-[10px] text-violet-50">
                Coming soon
              </span>
            </div>
            <p className="max-w-2xl text-sm text-slate-800">
              Intime will soon surface anomalies in pay changes, missing
              identifiers, and compliance gaps. Get intelligent recommendations
              to optimize your payroll process and ensure accuracy.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-700">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Anomaly detection
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Compliance validation
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Smart recommendations
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type ComingSoonFeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
};

function ComingSoonFeatureCard({
  icon,
  title,
  description,
  gradientFrom,
  gradientTo,
}: ComingSoonFeatureCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-md`}
        >
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <p className="text-xs text-slate-500">{description}</p>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
