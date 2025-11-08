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
  isWithinInterval,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string;  // ISO (optional)
};

function groupEventsByDay(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return events.reduce((acc, e) => {
    const s = parseISO(e.start);
    const key = format(s, "yyyy-MM-dd");
    (acc[key] ||= []).push(e);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
}

export default function CalendarMonth({ initialMonth, events }: { initialMonth?: Date; events: CalendarEvent[] }) {
  const [month, setMonth] = React.useState<Date>(initialMonth ?? new Date());

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // (Optional) We could filter events by visible range if your list gets big
  const byDay = React.useMemo(() => groupEventsByDay(events), [events]);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm">Events Calendar</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setMonth((m) => subMonths(m, 1))}>← Prev</Button>
          <div className="min-w-[10ch] text-sm text-center font-medium">{format(month, "LLLL yyyy")}</div>
          <Button size="sm" variant="outline" onClick={() => setMonth((m) => addMonths(m, 1))}>Next →</Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 text-center text-xs text-neutral-500">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="py-1">{d}</div>
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
              <div
                key={key}
                className={cn(
                  "min-h-24 rounded-md border p-2 text-xs",
                  isCurrentMonth ? "bg-white border-neutral-200" : "bg-neutral-50 border-neutral-200/60",
                  today && "ring-2 ring-black"
                )}
              >
                <div className={cn("mb-1 font-medium", !isCurrentMonth && "text-neutral-400")}>
                  {format(day, "d")}
                </div>

                {/* Event dots */}
                <div className="space-y-1">
                  {eventsForDay.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="truncate rounded-sm border border-neutral-200 bg-neutral-100 px-1 py-0.5"
                      title={e.title}
                    >
                      {e.title}
                    </div>
                  ))}
                  {eventsForDay.length > 3 && (
                    <div className="text-[10px] text-neutral-500">+{eventsForDay.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
