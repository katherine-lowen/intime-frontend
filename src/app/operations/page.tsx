// src/app/operations/page.tsx
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

export default function OperationsHomePage() {
  return (
    <AuthGate>
      <main className="p-6 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Operations</h1>
          <p className="text-sm text-muted-foreground">
            Analytics, payroll, and configuration that keep Intime running.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* People Analytics */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-2 inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              People
            </div>
            <h2 className="text-sm font-medium">People analytics</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Track headcount, turnover, hiring velocity, and manager load over time.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600">
                • Early signal: time-to-hire trending down
              </span>
              <Link
                href="/dashboard"
                className="text-xs font-medium text-primary hover:underline"
              >
                View dashboard
              </Link>
            </div>
          </div>

          {/* Hiring & ATS */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-2 inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Hiring
            </div>
            <h2 className="text-sm font-medium">Hiring operations</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Monitor pipeline health, stalled roles, and unusual candidates that might be moats.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-amber-600">
                • Watchlist: roles aging past SLA
              </span>
              <Link
                href="/hiring"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open hiring view
              </Link>
            </div>
          </div>

          {/* Time Off / Policies */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-2 inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Time off
            </div>
            <h2 className="text-sm font-medium">Time off & coverage</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              See who&apos;s out, which teams are thin, and how policies are being used in practice.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-sky-600">
                • Spike in PTO next month
              </span>
              <Link
                href="/timeoff"
                className="text-xs font-medium text-primary hover:underline"
              >
                View calendar
              </Link>
            </div>
          </div>

          {/* Payroll / Connectors – placeholder */}
          <div className="rounded-lg border bg-card p-4 opacity-80">
            <div className="mb-2 inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Payroll
            </div>
            <h2 className="text-sm font-medium">Payroll connectors</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Connect Gusto, Rippling, or ADP to sync comp bands, job codes, and time data.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                • Coming soon
              </span>
              <span className="text-[11px] text-slate-400">
                Integration setup
              </span>
            </div>
          </div>

          {/* Performance / Reviews – placeholder */}
          <div className="rounded-lg border bg-card p-4 opacity-80">
            <div className="mb-2 inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Performance
            </div>
            <h2 className="text-sm font-medium">Performance signals</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Blend reviews, promotions, and time signals to spot hidden champions and risk.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                • Coming soon
              </span>
              <span className="text-[11px] text-slate-400">
                Review cycles
              </span>
            </div>
          </div>

          {/* Settings – placeholder */}
          <div className="rounded-lg border bg-card p-4 opacity-80">
            <div className="mb-2 inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Settings
            </div>
            <h2 className="text-sm font-medium">Org settings</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Org details, permissions, time rules, and policy configuration.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                • Coming soon
              </span>
              <span className="text-[11px] text-slate-400">
                Admin controls
              </span>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
