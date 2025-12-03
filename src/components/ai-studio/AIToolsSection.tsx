// src/components/ai-studio/AIToolsSection.tsx

import { AIToolCard } from "./AIToolCard"
import {
  FileText,
  Briefcase,
  Users,
  BarChart3,
  Rocket,
  GitCompare,
  type LucideIcon,
} from "lucide-react"

type RawTool = {
  icon: LucideIcon
  title: string
  description: string
  categories: string[]
  metadata: { time: string; automation: string }
  gradient: string
}

const tools: RawTool[] = [
  {
    icon: Briefcase,
    title: "AI job intake",
    description:
      "Turn manager notes into a structured job brief with must-haves, interview focus areas, and success criteria.",
    categories: ["Hiring ops", "AI powered"],
    metadata: { time: "8 seconds", automation: "Fully automated" },
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: FileText,
    title: "AI job description",
    description:
      "Generate polished JDs with responsibilities, requirements, and a compelling summary.",
    categories: ["Content", "AI powered"],
    metadata: { time: "12 seconds", automation: "Uses Intime HRIS signals" },
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Users,
    title: "AI candidate summary",
    description:
      "Transform resumes, interview notes, and scorecards into clear narratives.",
    categories: ["Candidate intel", "AI powered"],
    metadata: { time: "6 seconds", automation: "Fully automated" },
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "AI performance review helper",
    description:
      "Convert messy bullet points into well-written performance narratives.",
    categories: ["Performance", "AI powered"],
    metadata: { time: "10 seconds", automation: "Uses Intime HRIS signals" },
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Rocket,
    title: "AI onboarding plan",
    description:
      "Generate a 30–60–90 day plan using role, level, and team context.",
    categories: ["Onboarding", "AI powered"],
    metadata: { time: "15 seconds", automation: "Uses Intime HRIS signals" },
    gradient: "from-rose-500 to-orange-500",
  },
  {
    icon: GitCompare,
    title: "AI resume match",
    description:
      "Compare a candidate against a job description. Highlight alignment, gaps, and suggested questions.",
    categories: ["Screening", "AI powered"],
    metadata: { time: "5 seconds", automation: "Fully automated" },
    gradient: "from-orange-500 to-amber-500",
  },
]

export function AIToolsSection() {
  return (
    <section className="mb-24">
      {/* Section header with gradient divider */}
      <div className="mb-16">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-12" />

        <div className="max-w-2xl">
          <h2 className="text-4xl mb-4 text-white">AI Tools</h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Choose a workflow to start. Every tool is integrated deeply across
            jobs, candidates, and people profiles.
          </p>
        </div>
      </div>

      {/* Tools grid with stagger */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, index) => (
          <div
            key={index}
            style={{
              transform: `translateY(${(index % 3) * 12}px)`,
            }}
          >
            <AIToolCard
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              categories={tool.categories}
              gradient={tool.gradient}
              metadata={[
                { label: "Time", value: tool.metadata.time },
                { label: "Automation", value: tool.metadata.automation },
              ]}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
