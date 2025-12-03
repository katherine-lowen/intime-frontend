import { Users, TrendingUp, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

export function HeadcountStructureCard() {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)' }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-[#E6E8EC] rounded-xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#F0F5FF] rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-[#2C6DF9]" />
          </div>
          <h2 className="text-[#0F1419]">Headcount & Structure</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Headcount */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[40px] text-[#0F1419]">247</span>
            <span className="text-[#22C55E] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>+12</span>
            </span>
          </div>
          <p className="text-[#5E6C84]">Total Employees</p>
        </div>

        {/* Structure Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#FAFBFC] rounded-lg border border-[#E6E8EC]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2C6DF9] rounded-full"></div>
              <span className="text-[#0F1419]">Full-time</span>
            </div>
            <span className="text-[#0F1419]">234</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-[#FAFBFC] rounded-lg border border-[#E6E8EC]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#8B5CF6] rounded-full"></div>
              <span className="text-[#0F1419]">Contractors</span>
            </div>
            <span className="text-[#0F1419]">13</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#FAFBFC] rounded-lg border border-[#E6E8EC]">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-[#5E6C84]" />
              <span className="text-[#0F1419]">Departments</span>
            </div>
            <span className="text-[#0F1419]">8</span>
          </div>
        </div>

        {/* Growth Trend */}
        <div className="pt-4 border-t border-[#E6E8EC]">
          <div className="flex items-center justify-between">
            <span className="text-[#5E6C84]">30-day growth</span>
            <span className="text-[#22C55E]">+5.1%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
