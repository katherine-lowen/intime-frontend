// src/app/hiring/ai-studio/job-description/page.tsx
import AiJobDescription from "@/components/ai-job-description";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

export default function JobDescriptionToolPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI job description
        </h1>
        <p className="text-sm text-slate-600">
          Generate a polished JD from a role summary, intake notes, or an existing posting.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <AiJobDescription />
      </section>
    </main>
  );
}
