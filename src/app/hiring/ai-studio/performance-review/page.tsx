// src/app/hiring/ai-studio/performance-review/page.tsx
import AiPerformanceReview from "@/components/ai-performance-review";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

// Demo context for standalone AI Studio usage
const demoEmployeeId = "demo-employee";
const demoEmployeeName = "Taylor Rivers";

export default function PerformanceReviewToolPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI performance review helper
        </h1>
        <p className="text-sm text-slate-600">
          Turn bullets, examples, and feedback into review-ready narratives.
          This view runs in demo mode when opened from AI Studio.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <AiPerformanceReview
          employeeId={demoEmployeeId}
          employeeName={demoEmployeeName}
        />
      </section>
    </main>
  );
}
