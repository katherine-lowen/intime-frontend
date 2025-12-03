"use client";

import { Calendar, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export type PublicHoliday = {
  name: string;
  date: string;        // e.g., "Dec 25"
  emoji: string;       // e.g., "🎄"
  season?: string | null;
};

export type PublicHolidaysCardProps = {
  holidays?: PublicHoliday[];
  isLoading?: boolean;
  error?: string | null;
};

// Default demo data
const DEFAULT_HOLIDAYS: PublicHoliday[] = [
  { name: "Christmas Day", date: "Dec 25", emoji: "🎄", season: "winter" },
  { name: "New Year's Day", date: "Jan 1", emoji: "🎆", season: "winter" },
  { name: "Martin Luther King Jr. Day", date: "Jan 20", emoji: "🇺🇸", season: "winter" },
];

export function PublicHolidaysCard(props: PublicHolidaysCardProps = {}) {
  const {
    holidays = DEFAULT_HOLIDAYS,
    isLoading,
    error,
  } = props;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)" }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#F0F9FF] via-white to-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#DBEAFE]/30 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#DBEAFE]/20 to-transparent rounded-full blur-xl" />

      {/* Light icons */}
      <div className="absolute top-4 right-8 text-2xl opacity-20">❄️</div>
      <div className="absolute bottom-8 right-12 text-xl opacity-15">✨</div>
      <div className="absolute top-12 right-20 text-lg opacity-10">🎄</div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-[#DBEAFE]">
              <Calendar className="w-5 h-5 text-[#2C6DF9]" />
            </div>
            <h2 className="text-[#0F1419] flex items-center gap-2">
              Upcoming Public Holidays
              <Sparkles className="w-4 h-4 text-[#2C6DF9]" />
            </h2>
          </div>
          <div className="px-3 py-1 bg-white/80 backdrop-blur-sm text-[#2C6DF9] rounded-full border border-[#DBEAFE]">
            {holidays.length} in view
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="mb-4 rounded-md border border-dashed border-[#DBEAFE] bg-[#F0F9FF] px-3 py-2 text-xs text-[#5E6C84]">
            Syncing holiday calendar…
          </div>
        )}

        {error && !isLoading && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Holidays List */}
        <div className="space-y-3">
          {holidays.map((holiday, index) => (
            <motion.div
              key={holiday.name + index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#E6E8EC] hover:border-[#2C6DF9]/30 hover:bg-white transition-all"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-[#DBEAFE] to-[#F0F9FF] rounded-xl flex items-center justify-center text-2xl border border-[#DBEAFE] group-hover:scale-110 transition-transform">
                {holiday.emoji}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-[#0F1419]">{holiday.name}</p>
                <p className="text-[#5E6C84]">{holiday.date}</p>
              </div>

              {/* Compact Date Badge */}
              <div className="px-3 py-1.5 bg-[#F0F9FF] text-[#2C6DF9] rounded-lg border border-[#DBEAFE]">
                {holiday.date.split(" ")[1]}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-[#DBEAFE]">
          <div className="flex items-start gap-2">
            <div className="text-xl mt-0.5">📅</div>
            <div>
              <p className="text-[#0F1419] mb-1">Holiday planning made easy</p>
              <p className="text-[#5E6C84]">
                Team time off is automatically coordinated around public holidays
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
