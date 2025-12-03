// src/app/operations/components/TeamLoadCoverageCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Shield, AlertCircle, Info, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import api from "@/lib/api";

type RiskLevel = "low" | "medium" | "high";

interface DayCapacity {
  day: string;
  capacity: number;
}

interface TeamCapacity {
  name: string;
  days: DayCapacity[];
  riskLevel: RiskLevel;
  available: number;
  total: number;
  conflicts: number;
  hiringPipeline: string;
  avgCapacity: number;
  nextConflict: string | null;
}

// This matches the backend `TeamHeatmapEmployee` type from analytics.service.ts
type TeamHeatmapEmployee = {
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string | null;
  managerName?: string | null;
  metrics: {
    upcomingPtoDays: number;
    pendingReviewsToGive: number;
    pendingReviewsAsReviewee: number;
    openTimeOffRequestsToApprove: number;
  };
  loadScore: number;
};

// ----- Demo fallback data (what you had before) -----
const DEMO_TEAMS: TeamCapacity[] = [
  {
    name: "Engineering",
    days: [
      { day: "Mon", capacity: 95 },
      { day: "Tue", capacity: 92 },
      { day: "Wed", capacity: 78 },
      { day: "Thu", capacity: 93 },
      { day: "Fri", capacity: 91 },
      { day: "Sat", capacity: 0 },
      { day: "Sun", capacity: 0 },
    ],
    riskLevel: "medium",
    available: 32,
    total: 35,
    conflicts: 0,
    hiringPipeline: "1 starts Monday",
    avgCapacity: 91,
    nextConflict: "Dec 11 (Wed)",
  },
  {
    name: "Product",
    days: [
      { day: "Mon", capacity: 94 },
      { day: "Tue", capacity: 88 },
      { day: "Wed", capacity: 95 },
      { day: "Thu", capacity: 89 },
      { day: "Fri", capacity: 92 },
      { day: "Sat", capacity: 0 },
      { day: "Sun", capacity: 0 },
    ],
    riskLevel: "low",
    available: 17,
    total: 18,
    conflicts: 0,
    hiringPipeline: "none",
    avgCapacity: 92,
    nextConflict: null,
  },
  {
    name: "Design",
    days: [
      { day: "Mon", capacity: 67 },
      { day: "Tue", capacity: 59 },
      { day: "Wed", capacity: 59 },
      { day: "Thu", capacity: 75 },
      { day: "Fri", capacity: 92 },
      { day: "Sat", capacity: 0 },
      { day: "Sun", capacity: 0 },
    ],
    riskLevel: "high",
    available: 8,
    total: 12,
    conflicts: 2,
    hiringPipeline: "none",
    avgCapacity: 70,
    nextConflict: "Dec 10-11 (Tue-Wed)",
  },
  {
    name: "Sales",
    days: [
      { day: "Mon", capacity: 95 },
      { day: "Tue", capacity: 91 },
      { day: "Wed", capacity: 95 },
      { day: "Thu", capacity: 82 },
      { day: "Fri", capacity: 95 },
      { day: "Sat", capacity: 0 },
      { day: "Sun", capacity: 0 },
    ],
    riskLevel: "low",
    available: 20,
    total: 22,
    conflicts: 0,
    hiringPipeline: "none",
    avgCapacity: 92,
    nextConflict: "Dec 12 (Thu)",
  },
];

const getRiskBadge = (level: RiskLevel) => {
  switch (level) {
    case "low":
      return {
        label: "Low Risk",
        color: "#2C6DF9",
        bg: "#EFF6FF",
        border: "#BFDBFE",
      };
    case "medium":
      return {
        label: "Medium Risk",
        color: "#F59E0B",
        bg: "#FFFBEB",
        border: "#FDE68A",
      };
    case "high":
      return {
        label: "High Risk",
        color: "#EF4444",
        bg: "#FEF2F2",
        border: "#FECACA",
      };
  }
};

const getCapacityColor = (capacity: number) => {
  if (capacity >= 80) return "#2C6DF9";
  if (capacity >= 60) return "#F59E0B";
  return "#EF4444";
};

const getCapacityRange = (days: DayCapacity[]) => {
  const workDays = days.filter((d) => d.capacity > 0);
  const min = Math.min(...workDays.map((d) => d.capacity));
  const max = Math.max(...workDays.map((d) => d.capacity));
  return `${min}–${max}%`;
};

// Build *approximate* team capacity from backend heatmap data
function buildTeamsFromHeatmap(data: TeamHeatmapEmployee[]): TeamCapacity[] {
  if (!data.length) return DEMO_TEAMS;

  const byDept = new Map<string, TeamHeatmapEmployee[]>();

  for (const emp of data) {
    const dept = emp.department || "Unassigned";
    if (!byDept.has(dept)) byDept.set(dept, []);
    byDept.get(dept)!.push(emp);
  }

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const teams: TeamCapacity[] = Array.from(byDept.entries()).map(
    ([name, employees]) => {
      const total = employees.length;

      const withUpcomingPto = employees.filter(
        (e) => e.metrics.upcomingPtoDays > 0,
      ).length;

      const avgUpcomingPto =
        employees.reduce((sum, e) => sum + e.metrics.upcomingPtoDays, 0) /
        Math.max(total, 1);

      const available = Math.max(total - withUpcomingPto, 0);
      const conflicts = withUpcomingPto;

      // Simple capacity estimate: fewer PTO days → higher capacity
      let avgCapacity = 100 - avgUpcomingPto * 4;
      avgCapacity = Math.max(50, Math.min(100, Math.round(avgCapacity)));

      let riskLevel: RiskLevel = "low";
      if (avgCapacity < 80 && avgCapacity >= 60) riskLevel = "medium";
      if (avgCapacity < 60) riskLevel = "high";

      const days: DayCapacity[] = daysOfWeek.map((day) => ({
        day,
        // Just spread the same avg capacity across Mon–Fri, 0 on weekend
        capacity: day === "Sat" || day === "Sun" ? 0 : avgCapacity,
      }));

      return {
        name,
        days,
        riskLevel,
        available,
        total,
        conflicts,
        hiringPipeline: "—", // you can wire this later if you track starts
        avgCapacity,
        nextConflict: null, // backend doesn’t expose dates yet
      };
    },
  );

  return teams;
}

export function TeamLoadCoverageCard() {
  const [teams, setTeams] = useState<TeamCapacity[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = (await api.get(
          "/analytics/team-heatmap",
        )) as TeamHeatmapEmployee[];

        if (!cancelled && Array.isArray(data)) {
          setTeams(buildTeamsFromHeatmap(data));
        }
      } catch (err) {
        console.error("[TeamLoadCoverageCard] Failed to load heatmap:", err);
        if (!cancelled) {
          // Fallback to demo data if API fails (404, 500, etc.)
          setTeams(DEMO_TEAMS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayTeams = teams ?? DEMO_TEAMS;

  const insights = [
    {
      severity: "critical",
      title:
        "Teams with lowest capacity should be monitored for overlapping PTO",
      description:
        "Use Intime to adjust coverage before capacity drops below minimum thresholds.",
      color: "#EF4444",
    },
    {
      severity: "warning",
      title: "Teams with medium capacity may be impacted by upcoming leave",
      description:
        "Review planned PTO and adjust staffing or hiring where needed.",
      color: "#F59E0B",
    },
    {
      severity: "healthy",
      title: "High capacity teams are healthy for the next 30 days",
      description: "No major conflicts detected from upcoming time off.",
      color: "#2C6DF9",
    },
  ];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm"
    >
      {/* Header */}
      <div className="border-b border-[#E5E7EB] px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2C6DF9]">
              <Shield className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-[#111827]">Team Capacity &amp; Staffing Risk</h2>
          </div>
          <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[#4B5563] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]">
            <span>View Details</span>
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Definition Box */}
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-3">
          <div className="flex items-start gap-2 text-sm">
            <Info
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6B7280]"
              strokeWidth={2}
            />
            <div className="leading-relaxed text-[#4B5563]">
              <strong className="text-[#111827]">Capacity</strong> = Available
              working staff / Required minimum staffing ·{" "}
              <strong className="text-[#111827]">Risk</strong> = PTO +
              overlapping leave + pipeline starts/stops + historical patterns
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Loading state */}
        {loading && (
          <div className="mb-4 text-sm text-[#6B7280]">
            Loading real-time capacity…
          </div>
        )}

        {/* Team Status Rows */}
        <div className="mb-6 space-y-3">
          {displayTeams.map((team, index) => {
            const badge = getRiskBadge(team.riskLevel);
            const workDays = team.days.filter((d) => d.capacity > 0);
            const maxCapacity = Math.max(...workDays.map((d) => d.capacity));

            return (
              <motion.div
                key={team.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-[#E5E7EB] p-4 transition-all hover:border-[#D1D5DB] hover:shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-[#111827]">{team.name}</span>
                      {badge && (
                        <span
                          className="rounded border px-2 py-1 text-xs"
                          style={{
                            color: badge.color,
                            backgroundColor: badge.bg,
                            borderColor: badge.border,
                          }}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-[#6B7280]">
                      <span>
                        Capacity:{" "}
                        <strong className="text-[#111827]">
                          {getCapacityRange(team.days)}
                        </strong>
                      </span>
                      {team.nextConflict && (
                        <span>
                          Next conflict:{" "}
                          <strong className="text-[#111827]">
                            {team.nextConflict}
                          </strong>
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-[#6B7280]">
                      {team.available}/{team.total} active
                    </div>
                  </div>
                </div>

                {/* Mini Bar Chart */}
                <div className="space-y-2">
                  <div className="flex h-16 items-end justify-between gap-1">
                    {workDays.map((day, dayIndex) => {
                      const heightPercent = (day.capacity / maxCapacity) * 100;
                      const color = getCapacityColor(day.capacity);

                      return (
                        <div
                          key={`${team.name}-${day.day}-${dayIndex}`}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <div className="flex h-12 w-full items-end justify-center">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1 + dayIndex * 0.05,
                              }}
                              className="w-full rounded-t"
                              style={{
                                backgroundColor: color,
                                opacity: day.capacity >= 80 ? 1 : 0.9,
                              }}
                            />
                          </div>
                          <span className="text-xs text-[#6B7280]">
                            {day.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Capacity Values */}
                  <div className="flex items-center justify-between gap-1 text-xs text-[#6B7280]">
                    {workDays.map((day, dayIndex) => (
                      <div
                        key={`${team.name}-${day.day}-value-${dayIndex}`}
                        className="flex-1 text-center"
                      >
                        <span style={{ color: getCapacityColor(day.capacity) }}>
                          {day.capacity}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Insights Section */}
        <div>
          <h3 className="mb-3 text-[#111827]">Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={`${insight.title}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="relative rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 pl-4"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                  style={{ backgroundColor: insight.color }}
                />
                <div>
                  <div className="mb-1 text-[#111827]">{insight.title}</div>
                  <div className="text-sm text-[#6B7280]">
                    {insight.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
