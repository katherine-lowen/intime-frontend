// src/components/calendar-month.tsx
"use client";

import * as React from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  parseISO,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string; // ISO (optional, inclusive)
  status?: "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED" | string;
  kind?:
    | "PTO"
    | "SICK"
    | "PERSONAL"
    | "UNPAID"
    | "JURY_DUTY"
    | "PARENTAL_LEAVE"
    | string;
  // optional arbitrary metadata (we’ll use this for the full TimeOffRequest)
  meta?: unknown;
};

function groupEventsByDay(
  events: CalendarEvent[]
): Record<string, CalendarEvent[]> {
  const acc: Record<string, CalendarEvent[]> = {};

  for (const e of events) {
    const start = parseISO(e.start);
    const end = e.end ? parseISO(e.end) : start;

    // Spread the event across all days in its range
    const daysInRange = eachDayOfInterval({ start, end });
    for (const day of daysInRange) {
      const key = format(day, "yyyy-MM-dd");
      (acc[key] ||= []).push(e);
    }
  }

  return acc;
}

function getEventClasses(e: CalendarEvent) {
  switch (e.status) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "REQUESTED":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "DENIED":
      return "border-rose-200 bg-rose-50 text-rose-800 line-through";
    case "CANCELLED":
      return "border-neutral-200 bg-neutral-50 text-neutral-500 italic";
    default:
      return "border-neutral-200 bg-neutral-100 text-neutral-800";
  }
}

export default function CalendarMonth({
  initialMonth,
  events,
  onDayClick,
}: {
  initialMonth?: Date;
  events: CalendarEvent[];
  onDayClick?: (date: Date, eventsForDay: CalendarEvent[]) => void;
}) {
  const [month, setMonth] = React.useState<Date>(initialMonth ?? new Date());

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const byDay = React.useMemo(() => groupEventsByDay(events), [events]);

  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-col">
          <CardTitle className="text-sm">Time Off Calendar</CardTitle>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Requested
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Denied
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMonth((m) => subMonths(m, 1))}
          >
            ← Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setMonth(new Date())}
          >
            Today
          </Button>
          <div className="min-w-[10ch] text-center text-sm font-medium">
            {format(month, "LLLL yyyy")}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            Next →
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 text-center text-xs text-neutral-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(day, monthStart);
            const today = isToday(day);
            const eventsForDay = byDay[key] || [];

            return (
              <button
                key={key}
                type="button"
                onClick={() => onDayClick?.(day, eventsForDay)}
                className={cn(
                  "min-h-24 rounded-md border p-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 focus-visible:ring-offset-white",
                  isCurrentMonth
                    ? "border-neutral-200 bg-white hover:bg-neutral-50"
                    : "border-neutral-200/60 bg-neutral-50 hover:bg-neutral-100",
                  today &&
                    "ring-2 ring-neutral-900 ring-offset-1 ring-offset-white"
                )}
              >
                <div
                  className={cn(
                    "mb-1 flex items-center justify-between font-medium",
                    !isCurrentMonth && "text-neutral-400"
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {today && (
                    <span className="rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Today
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {eventsForDay.slice(0, 3).map((e) => (
                    <div
                      key={`${e.id}-${key}`}
                      className={cn(
                        "flex items-center gap-1 truncate rounded-sm border px-1 py-0.5",
                        getEventClasses(e)
                      )}
                      title={e.title}
                    >
                      {e.kind && (
                        <span className="text-[9px] uppercase tracking-wide opacity-80">
                          {e.kind}
                        </span>
                      )}
                      <span className="truncate text-[11px]">{e.title}</span>
                    </div>
                  ))}
                  {eventsForDay.length > 3 && (
                    <div className="text-[10px] text-neutral-500">
                      +{eventsForDay.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
