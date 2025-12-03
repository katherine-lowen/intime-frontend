import { UserPlus, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'motion/react';

export function OnboardingPipelineCard() {
  const stages = [
    { label: 'Pre-boarding', count: 3, color: '#F59E0B' },
    { label: 'First Day', count: 2, color: '#2C6DF9' },
    { label: 'First Week', count: 5, color: '#8B5CF6' },
    { label: 'First Month', count: 4, color: '#22C55E' },
  ];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)' }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-[#E6E8EC] rounded-xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#F0F5FF] rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-[#2C6DF9]" />
          </div>
          <h2 className="text-[#0F1419]">Onboarding Pipeline</h2>
        </div>
        <div className="px-3 py-1 bg-[#F0F5FF] text-[#2C6DF9] rounded-full">
          14 active
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-3 mb-6">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E8EC] bg-[#FAFBFC] hover:border-[#2C6DF9]/30 transition-colors">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: stage.color }}
            ></div>
            <div className="flex-1">
              <span className="text-[#0F1419]">{stage.label}</span>
            </div>
            <div className="px-3 py-1 bg-white rounded-md border border-[#E6E8EC]">
              <span className="text-[#0F1419]">{stage.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Onboardings */}
      <div className="pt-6 border-t border-[#E6E8EC]">
        <h3 className="text-[#0F1419] mb-4">Recent</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2C6DF9] to-[#8B5CF6] rounded-full flex items-center justify-center text-white">
              AK
            </div>
            <div className="flex-1">
              <p className="text-[#0F1419]">Alex Kim</p>
              <p className="text-[#5E6C84]">Engineering · Day 3</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#06B6D4] rounded-full flex items-center justify-center text-white">
              SP
            </div>
            <div className="flex-1">
              <p className="text-[#0F1419]">Sofia Patel</p>
              <p className="text-[#5E6C84]">Product · Day 1</p>
            </div>
            <Circle className="w-5 h-5 text-[#E6E8EC]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
