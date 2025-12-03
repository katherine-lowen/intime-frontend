"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "./utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-slate-50",
        nav: "space-x-1 flex items-center",
        nav_button:
          "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-slate-700 text-slate-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-slate-400 rounded-md w-8 font-normal text-[0.7rem] flex items-center justify-center",
        row: "flex w-full mt-1",
        cell: cn(
          "relative h-8 w-8 text-center text-xs p-0",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-range-start)]:rounded-l-md",
          "[&:has([aria-selected])]:bg-slate-800/80"
        ),
        day: cn(
          "h-8 w-8 rounded-md p-0 font-normal aria-selected:opacity-100",
          "text-slate-100 hover:bg-slate-800/70"
        ),
        day_selected:
          "bg-indigo-500 text-slate-50 hover:bg-indigo-500 hover:text-slate-50",
        day_today:
          "bg-slate-800 text-slate-50 border border-slate-600 font-semibold",
        day_outside:
          "day-outside text-slate-500 opacity-50 aria-selected:bg-slate-800/40",
        day_disabled: "text-slate-500 opacity-40",
        day_range_middle:
          "aria-selected:bg-slate-800 aria-selected:text-slate-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
