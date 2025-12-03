"use client";

import { Shield, AlertCircle, Info, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

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

export function TeamLoadCoverageCard() {
  const teams: TeamCapacity[] = [
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

  const insights = [
    {
      severity: "critical",
      title: "Design expected to drop below minimum staffing Tue–Wed (59%)",
      description: "2 overlapping PTO periods creating capacity gap",
      color: "#EF4444",
    },
    {
      severity: "warning",
      title: "Engineering capacity dips on Wed due to 2 overlapping PTO entries",
      description: "Capacity drops to 78% — still above minimum threshold",
      color: "#F59E0B",
    },
    {
      severity: "healthy",
      title: "Product capacity stable (88–95%) all week",
      description: "No conflicts detected in next 7 days",
      color: "#2C6DF9",
    },
  ];

  const DefinitionIcon = AlertCircle; // you imported it, might as well use it if needed later

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
              <strong className="text-[#111827]">Capacity</strong> = Available working
              staff / Required minimum staffing ·{" "}
              <strong className="text-[#111827]">Risk</strong> = PTO + overlapping
              leave + pipeline starts/stops + historical patterns
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Team Status Rows */}
        <div className="mb-6 space-y-3">
          {teams.map((team, index) => {
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
                          className="rounded px-2 py-1 text-xs border"
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
                          <span className="text-xs text-[#6B7280]">{day.day}</span>
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

        {/* Department Snapshots */}
        <div className="mb-6">
          <h3 className="mb-3 text-[#111827]">Department Snapshots</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {teams.map((team, index) => (
              <motion.div
                key={`${team.name}-snapshot`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
              >
                <div className="mb-3 text-[#111827]">{team.name}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] py-1">
                    <span className="text-[#6B7280]">Availability</span>
                    <span className="text-[#111827]">
                      {team.available}/{team.total} active
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] py-1">
                    <span className="text-[#6B7280]">Conflicts</span>
                    <span className="text-[#111827]">{team.conflicts}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] py-1">
                    <span className="text-[#6B7280]">Hiring pipeline</span>
                    <span className="text-[#111827]">
                      {team.hiringPipeline}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#6B7280]">
                      Avg capacity next 7 days
                    </span>
                    <span className="text-[#111827]">
                      {team.avgCapacity}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
                {/* Left border strip */}
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
