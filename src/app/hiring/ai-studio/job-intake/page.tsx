// src/app/hiring/ai-studio/job-intake/page.tsx
import AiJobIntakeForm from "@/components/ai-job-intake-form";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

export default function JobIntakeToolPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI job intake
        </h1>
        <p className="text-sm text-slate-600">
          Turn a hiring manager&apos;s notes into a structured job brief you can reuse across JD, interview plan, and onboarding.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <AiJobIntakeForm />
      </section>
    </main>
  );
}
