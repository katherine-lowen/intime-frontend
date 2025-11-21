// src/app/hiring/ai-studio/resume-match/page.tsx
import AiResumeMatch from "@/components/ai-resume-match";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

export default function ResumeMatchToolPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI resume match
        </h1>
        <p className="text-sm text-slate-600">
          Compare a candidate against a job description and surface alignment, risks, and suggested follow-up questions.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <AiResumeMatch />
      </section>
    </main>
  );
}
