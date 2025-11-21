// src/app/payroll/page.tsx
import ComingSoon from "@/components/coming-soon";

export const dynamic = "force-dynamic";

export default function PayrollPage() {
  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Payroll</h1>
          <p className="text-sm text-slate-500">
            Connect your payroll provider and see time-aware insights.
          </p>
        </div>
      </header>

      <ComingSoon
        title="Payroll module coming soon"
        description="In the full Intime platform, this is where you'll connect Gusto, ADP, or Rippling and see time-aware payroll insights by team, schedule, and policy."
      />
    </main>
  );
}
