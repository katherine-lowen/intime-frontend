import { Brain, FileText, Users, Sparkles, Target, Wand2 } from "lucide-react"
import { AIToolCard, type AIToolCardProps } from "./AIToolCard"

const tools: Array<
  Omit<AIToolCardProps, "metadata" | "gradient"> & {
    metadata?: AIToolCardProps["metadata"]
    gradient?: AIToolCardProps["gradient"]
  }
> = [
  {
    icon: FileText,
    title: "AI job intake",
    description:
      "Turn messy hiring manager notes into a structured brief with must-haves, nice-to-haves, and interview focus areas.",
    categories: ["Hiring ops", "Workflows"],
    metadata: [
      { label: "Latency", value: "Seconds" },
      { label: "Source", value: "Intake notes" },
    ],
  },
  {
    icon: Sparkles,
    title: "AI job description",
    description:
      "Generate polished, on-brand job descriptions tailored to level, location, and team context.",
    categories: ["Content", "Brand-safe"],
    metadata: [
      { label: "Output", value: "JD draft" },
      { label: "Signal", value: "Role profile" },
    ],
  },
  {
    icon: Brain,
    title: "AI candidate summary",
    description:
      "Summarize resumes, interview notes, and scorecards into a narrative you can share with hiring managers.",
    categories: ["Candidate intel"],
    metadata: [
      { label: "Inputs", value: "Notes + CV" },
      { label: "View", value: "One-pager" },
    ],
  },
  {
    icon: Target,
    title: "AI performance review helper",
    description:
      "Turn bullet points into review-ready narratives that still sound like your managers.",
    categories: ["Performance"],
    metadata: [
      { label: "Cycle", value: "Reviews" },
      { label: "Tone", value: "Human" },
    ],
  },
  {
    icon: Users,
    title: "AI onboarding plan",
    description:
      "Create 30–60–90 day plans tailored to role, level, and manager expectations.",
    categories: ["Onboarding"],
    metadata: [
      { label: "Horizon", value: "90 days" },
      { label: "Owner", value: "Manager" },
    ],
  },
  {
    icon: Wand2,
    title: "AI resume match",
    description:
      "Score candidates against a live job description, surface alignment, gaps, and suggested follow-ups.",
    categories: ["Screening"],
    metadata: [
      { label: "Scoring", value: "Fit score" },
      { label: "Signals", value: "Skills + exp" },
    ],
  },
]

export function AIToolsGrid() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          AI tools
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-2xl">
          Mix and match Intime&apos;s AI helpers across jobs, candidates, and people.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <AIToolCard key={index} {...tool} />
        ))}
      </div>
    </div>
  )
}
