"use client";

import { Palmtree, Users, Calendar } from "lucide-react";
import { motion } from "motion/react";

export interface UpcomingTimeOff {
  name: string;
  initials: string;
  dateRange: string;
  typeLabel: string;
  avatarFrom: string;
  avatarTo: string;
  badgeBg: string;
  badgeTextColor: string;
}

export type TimeOffPTOCardProps = {
  outToday?: number;
  thisWeek?: number;
  upcoming?: UpcomingTimeOff[];
  isLoading?: boolean;
  error?: string | null;
};

const DEFAULT_OUT_TODAY = 12;
const DEFAULT_THIS_WEEK = 28;

const DEFAULT_UPCOMING: UpcomingTimeOff[] = [
  {
    name: "Jessica Wong",
    initials: "JW",
    dateRange: "Dec 9 - Dec 13",
    typeLabel: "Vacation",
    avatarFrom: "#8B5CF6",
    avatarTo: "#D946EF",
    badgeBg: "#ECFDF5",
    badgeTextColor: "#10B981",
  },
  {
    name: "David Lee",
    initials: "DL",
    dateRange: "Dec 16 - Dec 20",
    typeLabel: "PTO",
    avatarFrom: "#F59E0B",
    avatarTo: "#EF4444",
    badgeBg: "#FEF3C7",
    badgeTextColor: "#F59E0B",
  },
  {
    name: "Maria Rodriguez",
    initials: "MR",
    dateRange: "Dec 23 - Jan 3",
    typeLabel: "Vacation",
    avatarFrom: "#06B6D4",
    avatarTo: "#3B82F6",
    badgeBg: "#ECFDF5",
    badgeTextColor: "#10B981",
  },
];

export function TimeOffPTOCard({
  outToday = DEFAULT_OUT_TODAY,
  thisWeek = DEFAULT_THIS_WEEK,
  upcoming = DEFAULT_UPCOMING,
  isLoading,
  error,
}: TimeOffPTOCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)" }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-[#E6E8EC] bg-white p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ECFDF5]">
            <Palmtree className="h-5 w-5 text-[#10B981]" />
          </div>
          <h2 className="text-[#0F1419]">Time Off &amp; PTO</h2>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#E6E8EC] bg-[#FAFBFC] p-4">
          <div className="mb-1 text-[#5E6C84]">Out Today</div>
          <div className="text-[28px] text-[#0F1419]">{outToday}</div>
        </div>
        <div className="rounded-lg border border-[#E6E8EC] bg-[#FAFBFC] p-4">
          <div className="mb-1 text-[#5E6C84]">This Week</div>
          <div className="text-[28px] text-[#0F1419]">{thisWeek}</div>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 rounded-md border border-dashed border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Loading upcoming time off…
        </div>
      )}

      {error && !isLoading && (
        <div className="mb-3 rounded-md border border-dashed border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Upcoming Time Off */}
      <div className="space-y-3">
        <h3 className="text-[#0F1419]">Upcoming</h3>

        {upcoming.map((item, index) => (
          <div
            key={`${item.name}-${item.dateRange}-${index}`}
            className="flex items-center gap-3 rounded-lg border border-[#E6E8EC] bg-[#FAFBFC] p-3"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${item.avatarFrom}, ${item.avatarTo})`,
              }}
            >
              {item.initials}
            </div>
            <div className="flex-1">
              <p className="text-[#0F1419]">{item.name}</p>
              <p className="text-[#5E6C84]">{item.dateRange}</p>
            </div>
            <div
              className="rounded-md px-2 py-1 text-sm"
              style={{
                backgroundColor: item.badgeBg,
                color: item.badgeTextColor,
              }}
            >
              {item.typeLabel}
            </div>
          </div>
        ))}

        {upcoming.length === 0 && !isLoading && !error && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-[#E6E8EC] bg-[#FAFBFC] px-3 py-2 text-xs text-[#6B7280]">
            <Calendar className="h-4 w-4" />
            <span>No upcoming time off in the next 30 days.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
