import { Cake, PartyPopper } from 'lucide-react';
import { motion } from 'motion/react';

export function BirthdaysCard() {
  const birthdays = [
    { name: 'Emma Thompson', date: 'Dec 8', avatar: 'ET', days: 5 },
    { name: 'James Park', date: 'Dec 12', avatar: 'JP', days: 9 },
    { name: 'Nina Gupta', date: 'Dec 18', avatar: 'NG', days: 15 },
  ];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)' }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#FFF1F2] via-white to-[#FECDD3]/30 border border-[#FECDD3] rounded-xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FDE2E4]/40 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-[#FECDD3]/30 to-transparent rounded-full blur-xl"></div>
      
      {/* Confetti decorations */}
      <div className="absolute top-6 right-10 text-2xl opacity-20">🎈</div>
      <div className="absolute bottom-10 right-8 text-xl opacity-15">🎉</div>
      <div className="absolute top-16 right-24 text-lg opacity-10">🎂</div>
      <div className="absolute bottom-20 left-8 text-lg opacity-10">🥳</div>

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-[#FECDD3]">
              <Cake className="w-5 h-5 text-[#F43F5E]" />
            </div>
            <h2 className="text-[#0F1419] flex items-center gap-2">
              Upcoming Birthdays
              <PartyPopper className="w-4 h-4 text-[#F43F5E]" />
            </h2>
          </div>
          <div className="px-3 py-1 bg-white/80 backdrop-blur-sm text-[#F43F5E] rounded-full border border-[#FECDD3]">
            {birthdays.length} coming up
          </div>
        </div>

        {/* Birthday List */}
        <div className="space-y-3">
          {birthdays.map((birthday, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#E6E8EC] hover:border-[#F43F5E]/30 hover:bg-white transition-all"
            >
              {/* Avatar with gradient */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F43F5E] via-[#FB7185] to-[#FDA4AF] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {birthday.avatar}
                </div>
                {/* Birthday cake emoji badge */}
                <div className="absolute -top-1 -right-1 text-lg">🎂</div>
              </div>
              
              {/* Birthday Info */}
              <div className="flex-1">
                <p className="text-[#0F1419]">{birthday.name}</p>
                <p className="text-[#5E6C84]">{birthday.date} · In {birthday.days} days</p>
              </div>

              {/* Celebration Badge */}
              <div className="px-3 py-1.5 bg-gradient-to-r from-[#FFF1F2] to-[#FECDD3]/50 text-[#F43F5E] rounded-lg border border-[#FECDD3]">
                🎉
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Message */}
        <div className="mt-6 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-[#FECDD3]">
          <div className="flex items-start gap-2">
            <div className="text-xl mt-0.5">🎁</div>
            <div>
              <p className="text-[#0F1419] mb-1">Never miss a celebration</p>
              <p className="text-[#5E6C84]">Automatic reminders help you celebrate your team's special days</p>
            </div>
          </div>
        </div>

        {/* Subtle animated sparkles on hover */}
        <motion.div
          className="absolute top-8 left-12 text-2xl pointer-events-none"
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ✨
        </motion.div>
      </div>
    </motion.div>
  );
}
