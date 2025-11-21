// src/app/operations/page.tsx
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

export default function OperationsHomePage() {
  return (
    <main className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Operations</h1>
        <p className="text-sm text-muted-foreground">
          Analytics, payroll, and configuration that keep Intime running.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 opacity-70">
          <div className="mb-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Coming soon
          </div>
          <h2 className="text-sm font-medium">Analytics</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Dashboards for headcount, hiring velocity, and time intelligence.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 opacity-70">
          <div className="mb-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Coming soon
          </div>
          <h2 className="text-sm font-medium">Payroll</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Integrations, cost breakdowns, and upcoming pay cycles.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 opacity-70">
          <div className="mb-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Coming soon
          </div>
          <h2 className="text-sm font-medium">Settings</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Org details, permissions, and policy configuration.
          </p>
        </div>
      </section>
    </main>
  );
}
