// src/app/hiring/ai-studio/page.tsx
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

const tools = [
  {
    id: "job-intake",
    title: "AI job intake",
    tag: "Hiring ops",
    icon: "🧾",
    href: "/hiring/ai-studio/job-intake",
    description:
      "Turn a hiring manager’s notes into a structured job brief, with must-haves, nice-to-haves, and interview focus areas.",
  },
  {
    id: "jd-generator",
    title: "AI job description",
    tag: "Content",
    icon: "✏️",
    href: "/hiring/ai-studio/job-description",
    description:
      "Generate a polished JD with responsibilities, requirements, and a compelling summary.",
  },
  {
    id: "candidate-summary",
    title: "AI candidate summary",
    tag: "Candidate intel",
    icon: "🧠",
    href: "/hiring/ai-studio/candidate-summary",
    description:
      "Summarize messy interview notes, resumes, and scorecards into a clear narrative.",
  },
  {
    id: "performance-review",
    title: "AI performance review helper",
    tag: "Performance",
    icon: "📈",
    href: "/hiring/ai-studio/performance-review",
    description:
      "Turn bullet points and feedback into review-ready narratives that still sound like your managers.",
  },
  {
    id: "onboarding-plan",
    title: "AI onboarding plan",
    tag: "Onboarding",
    icon: "🧭",
    href: "/hiring/ai-studio/onboarding-plan",
    description:
      "Create a 30–60–90 day plan for new hires using their role, level, and team context.",
  },
  {
    id: "resume-match",
    title: "AI resume match",
    tag: "Screening",
    icon: "⚡️",
    href: "/hiring/ai-studio/resume-match",
    description:
      "Instantly score a candidate against a job description and highlight alignment, gaps, and follow-up questions.",
  },
];

export default function AiStudioPage() {
  return (
    <div className="relative min-h-screen">
      {/* background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-slate-50" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-200/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full bg-sky-100/50 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='none'/%3E%3Cg fill='%239CA3AF' fill-opacity='0.18'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='60' cy='40' r='1'/%3E%3Ccircle cx='120' cy='90' r='1'/%3E%3Ccircle cx='30' cy='120' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* HERO */}
        <section className="relative">
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-tr from-indigo-500/20 via-indigo-300/10 to-sky-300/30 p-[1px] shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
            <div className="relative flex flex-col gap-8 rounded-[28px] border border-white/60 bg-white/85 p-8 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <div className="pointer-events-none absolute -top-28 -right-40 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-120px] left-[-60px] h-80 w-80 rounded-full bg-sky-100/60 blur-3xl" />

              <div className="relative space-y-5 md:max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Intime AI Studio
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Early access
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-[2.1rem] font-semibold leading-tight tracking-tight text-slate-900 md:text-[2.4rem]">
                    Orchestrate hiring with{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                      AI-native workflows.
                    </span>
                  </h1>
                  <p className="max-w-2xl text-sm text-slate-600">
                    Centralize Intime&apos;s AI tools for hiring—from job intake and job
                    descriptions to candidate summaries, performance reviews, and
                    onboarding plans. Every tool is powered by your live people and event data.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-slate-900 px-3 py-1 font-medium text-slate-50 shadow-sm">
                    Built for talent &amp; HR teams
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                    Time-aware insights
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                    Works on Intime HRIS data
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      6 AI tools
                    </div>
                    <div>Job intake → onboarding.</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      0 copy-paste
                    </div>
                    <div>Everything lives in one system.</div>
                  </div>
                </div>
              </div>

              {/* right preview card */}
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-[-1px] rounded-[22px] bg-gradient-to-tr from-indigo-400/40 via-slate-900 to-sky-400/40 opacity-70 blur-lg" />
                <div className="relative rounded-[20px] border border-indigo-400/40 bg-slate-950 p-4 text-slate-50 shadow-[0_20px_40px_rgba(15,23,42,0.7)]">
                  <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>AI workflow preview</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      Live
                    </span>
                  </div>

                  <div className="space-y-3 text-[11px]">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/25 text-[10px]">
                        JD
                      </div>
                      <div>
                        <div className="font-medium">PMM job description</div>
                        <div className="text-slate-400">
                          Drafted from intake notes in 8 seconds.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px]">
                        ▲
                      </div>
                      <div>
                        <div className="font-medium">Top candidates ranked</div>
                        <div className="text-slate-400">
                          Fit score and key signals surfaced automatically.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[10px]">
                        90
                      </div>
                      <div>
                        <div className="font-medium">Onboarding milestones</div>
                        <div className="text-slate-400">
                          Personalized 30–60–90 day plan synced to their manager.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                    <span>Powered by event data</span>
                    <span className="text-emerald-300">No manual input</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOOLS GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                AI tools
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Choose a workflow to start. Each tool is deeply integrated across jobs,
                candidates, and people profiles.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                id={tool.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-36 w-36 rounded-full bg-indigo-100 opacity-0 blur-2xl transition group-hover:opacity-100" />

                <div className="relative space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="inline-flex items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                        {tool.tag}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                        AI powered
                      </span>
                    </div>
                    <span className="text-lg">{tool.icon}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    {tool.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {tool.description}
                  </p>
                </div>

                <div className="relative mt-4 flex items-center justify-between text-xs">
                  <Link
                    href={tool.href}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span>Open tool</span>
                    <span aria-hidden>↗</span>
                  </Link>
                  <span className="text-[11px] text-slate-400">
                    Connects to workflows
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-10">
          <p className="text-[11px] text-slate-400">
            Each tool will get its own dedicated route, wired directly to your existing components in{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
              src/components/ai-*.tsx
            </code>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
