"use client"

import * as React from "react"
import { cn } from "./utils"

//
// Chart config + context
//

export type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
  }
>

type ChartContextValue = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

export function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return ctx
}

//
// Container – wraps your Recharts chart
//

export type ChartContainerProps = {
  config: ChartConfig
  className?: string
  children: React.ReactNode
}

export function ChartContainer({
  config,
  className,
  children,
}: ChartContainerProps) {
  // generate CSS vars for each config color: --color-{key}
  const style = React.useMemo<React.CSSProperties>(() => {
    const vars: React.CSSProperties = {}
    for (const [key, value] of Object.entries(config)) {
      if (value.color) {
        ;(vars as any)[`--color-${key}`] = value.color
      }
    }
    return vars
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          "flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4",
          className
        )}
        style={style}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

//
// Tooltip
//

export type ChartTooltipContentProps = {
  /** Provided by Recharts Tooltip */
  active?: boolean
  payload?: any[]
  label?: any
  /** Custom props */
  hideLabel?: boolean
  indicator?: "dot" | "line"
  className?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel,
  indicator = "dot",
  className,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-md border border-slate-800 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-lg",
        className
      )}
    >
      {!hideLabel && label ? (
        <div className="mb-1 font-medium text-slate-300">{label}</div>
      ) : null}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = item.dataKey?.toString() ?? ""
          const cfg = config[key]
          const name = cfg?.label ?? item.name ?? key
          const color =
            (cfg?.color as string | undefined) ?? (item.color as string | undefined)

          return (
            <div key={index} className="flex items-center gap-2">
              {indicator === "dot" ? (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ) : (
                <span
                  className="h-0.5 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
              <span className="text-slate-300">{name}</span>
              <span className="ml-auto font-medium text-slate-100">
                {item.value as any}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

//
// Legend
//

export type ChartLegendContentProps = {
  /** Provided by Recharts Legend */
  payload?: any[]
  className?: string
}

export function ChartLegendContent({
  payload,
  className,
}: ChartLegendContentProps) {
  const { config } = useChart()

  if (!payload || payload.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-[11px] text-slate-300",
        className
      )}
    >
      {payload.map((entry: any, index: number) => {
        const key = entry.dataKey?.toString() ?? ""
        const cfg = config[key]
        const label = cfg?.label ?? entry.value ?? key
        const color =
          (cfg?.color as string | undefined) ?? (entry.color as string | undefined)

        return (
          <div key={index} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
