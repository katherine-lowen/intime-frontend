// src/app/hiring/ai-studio/page.tsx

import Link from "next/link"
import { AuthGate } from "@/components/dev-auth-gate"

import { Hero } from "@/components/ai-studio/Hero"
import { AIToolsSection } from "@/components/ai-studio/AIToolsSection"
import { ComingSoonSection } from "@/components/ai-studio/ComingSoonSection"
import { BackgroundEffects } from "@/components/ai-studio/BackgroundEffects"

export const dynamic = "force-dynamic"

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
]

export default function AiStudioPage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <BackgroundEffects />

        <div className="relative z-10">
          <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-24 space-y-16">
            {/* Figma hero + top content */}
            <Hero />
            <AIToolsSection />

            {/* Intime tools grid wired to real routes */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Live AI tools
                  </h2>
                  <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                    Choose a workflow to start. Each tool is integrated across jobs,
                    candidates, and people profiles in Intime.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    id={tool.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/70 hover:shadow-[0_18px_40px_rgba(15,23,42,0.9)]"
                  >
                    <div className="pointer-events-none absolute -right-20 -top-20 h-36 w-36 rounded-full bg-indigo-500/20 opacity-0 blur-2xl transition group-hover:opacity-100" />

                    <div className="relative space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="inline-flex items-center gap-2 text-[11px]">
                          <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-300">
                            {tool.tag}
                          </span>
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 font-medium text-slate-300">
                            AI powered
                          </span>
                        </div>
                        <span className="text-lg">{tool.icon}</span>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-50">
                        {tool.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {tool.description}
                      </p>
                    </div>

                    <div className="relative mt-4 flex items-center justify-between text-xs">
                      <Link
                        href={tool.href}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 font-medium text-slate-100 transition hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-100"
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

            {/* Figma "coming soon" section */}
            <ComingSoonSection />

            {/* Footer note */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500">
                Each tool has its own dedicated route, wired directly to your existing
                components in{" "}
                <code className="rounded bg-slate-900 px-1.5 py-0.5 text-[11px]">
                  src/components/ai-*.tsx
                </code>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  )
}
