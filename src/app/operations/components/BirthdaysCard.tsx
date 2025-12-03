"use client";

import { Cake, PartyPopper } from "lucide-react";
import { motion } from "motion/react";

export type BirthdayItem = {
  name: string;
  date: string;
  avatar: string;
  days: number;
};

type BirthdaysCardProps = {
  birthdays?: BirthdayItem[];
};

export function BirthdaysCard({ birthdays }: BirthdaysCardProps) {
  // Use data from props if provided, otherwise fall back to demo data
  const items: BirthdayItem[] =
    birthdays && birthdays.length
      ? birthdays
      : [
          { name: "Emma Thompson", date: "Dec 8", avatar: "ET", days: 5 },
          { name: "James Park", date: "Dec 12", avatar: "JP", days: 9 },
          { name: "Nina Gupta", date: "Dec 18", avatar: "NG", days: 15 },
        ];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)" }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#FFF1F2] via-white to-[#FECDD3]/30 border border-[#FECDD3] rounded-xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FDE2E4]/40 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-[#FECDD3]/30 to-transparent rounded-full blur-xl" />
      {/* Confetti decorations */}
      <div className="absolute top-6 right-10 text-2xl opacity-20">🎈</div>
      <div className="absolute bottom-10 right-8 text-xl opacity-15">🎉</div>
      <div className="absolute top-16 right-24 text-lg opacity-10">🎂</div>
      <div className="absolute bottom-20 left-8 text-lg opacity-10">🥳</div>

      <div className="relative">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECDD3] bg-white/80 backdrop-blur-sm">
              <Cake className="h-5 w-5 text-[#F43F5E]" />
            </div>
            <h2 className="flex items-center gap-2 text-[#0F1419]">
              Upcoming Birthdays
              <PartyPopper className="h-4 w-4 text-[#F43F5E]" />
            </h2>
          </div>
          <div className="rounded-full border border-[#FECDD3] bg-white/80 px-3 py-1 text-[#F43F5E] backdrop-blur-sm">
            {items.length} coming up
          </div>
        </div>

        {/* Birthday List */}
        <div className="space-y-3">
          {items.map((birthday, index) => (
            <motion.div
              key={`${birthday.name}-${birthday.date}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex items-center gap-4 rounded-xl border border-[#E6E8EC] bg-white/80 p-4 backdrop-blur-sm transition-all hover:border-[#F43F5E]/30 hover:bg-white"
            >
              {/* Avatar with gradient */}
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F43F5E] via-[#FB7185] to-[#FDA4AF] text-white transition-transform group-hover:scale-110">
                  {birthday.avatar}
                </div>
                {/* Birthday cake emoji badge */}
                <div className="absolute -right-1 -top-1 text-lg">🎂</div>
              </div>

              {/* Birthday Info */}
              <div className="flex-1">
                <p className="text-[#0F1419]">{birthday.name}</p>
                <p className="text-[#5E6C84]">
                  {birthday.date} · In {birthday.days} days
                </p>
              </div>

              {/* Celebration Badge */}
              <div className="rounded-lg border border-[#FECDD3] bg-gradient-to-r from-[#FFF1F2] to-[#FECDD3]/50 px-3 py-1.5 text-[#F43F5E]">
                🎉
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Message */}
        <div className="mt-6 rounded-xl border border-[#FECDD3] bg-white/60 p-4 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 text-xl">🎁</div>
            <div>
              <p className="mb-1 text-[#0F1419]">Never miss a celebration</p>
              <p className="text-[#5E6C84]">
                Automatic reminders help you celebrate your team&apos;s special days
              </p>
            </div>
          </div>
        </div>

        {/* Subtle animated sparkles on hover */}
        <motion.div
          className="pointer-events-none absolute left-12 top-8 text-2xl"
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>
      </div>
    </motion.div>
  );
}
