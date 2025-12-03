import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/components/ui/utils"

export type AIToolCardProps = {
  icon: LucideIcon
  title: string
  description: string
  categories: string[]
  /**
   * Optional small pill-style metadata items (e.g. “Hiring”, “Workflow”).
   */
  metadata?: { label: string; value: string }[]
  /**
   * Optional tailwind gradient classes for the card background halo.
   */
  gradient?: string
}

export const AIToolCard: React.FC<AIToolCardProps> = ({
  icon: Icon,
  title,
  description,
  categories,
  metadata,
  gradient,
}) => {
  const effectiveGradient =
    gradient ?? "from-indigo-500/20 via-slate-900/60 to-sky-500/20"

  const effectiveMetadata = metadata ?? []

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/70 hover:shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
      {/* Glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-20 -top-20 h-36 w-36 rounded-full opacity-0 blur-2xl transition group-hover:opacity-100",
          "bg-gradient-to-tr",
          effectiveGradient
        )}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-[11px]">
          {categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-slate-800 px-2 py-0.5 font-medium text-slate-300"
            >
              {cat}
            </span>
          ))}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-100">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Body */}
      <div className="relative mt-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
        <p className="text-xs leading-relaxed text-slate-300">{description}</p>
      </div>

      {/* Footer */}
      {(effectiveMetadata.length ?? 0) > 0 && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {effectiveMetadata.map((item, idx) => (
            <span
              key={`${item.label}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-medium text-slate-300"
            >
              <span className="text-slate-500">{item.label}</span>
              <span className="text-slate-100">{item.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default AIToolCard
