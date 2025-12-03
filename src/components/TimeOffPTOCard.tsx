import { Palmtree, Users, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export function TimeOffPTOCard() {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)' }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-[#E6E8EC] rounded-xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
            <Palmtree className="w-5 h-5 text-[#10B981]" />
          </div>
          <h2 className="text-[#0F1419]">Time Off & PTO</h2>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-[#FAFBFC] rounded-lg border border-[#E6E8EC]">
          <div className="text-[#5E6C84] mb-1">Out Today</div>
          <div className="text-[28px] text-[#0F1419]">12</div>
        </div>
        <div className="p-4 bg-[#FAFBFC] rounded-lg border border-[#E6E8EC]">
          <div className="text-[#5E6C84] mb-1">This Week</div>
          <div className="text-[28px] text-[#0F1419]">28</div>
        </div>
      </div>

      {/* Upcoming Time Off */}
      <div className="space-y-3">
        <h3 className="text-[#0F1419]">Upcoming</h3>
        
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E8EC] bg-[#FAFBFC]">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] rounded-full flex items-center justify-center text-white">
            JW
          </div>
          <div className="flex-1">
            <p className="text-[#0F1419]">Jessica Wong</p>
            <p className="text-[#5E6C84]">Dec 9 - Dec 13</p>
          </div>
          <div className="px-2 py-1 bg-[#ECFDF5] text-[#10B981] rounded-md">
            Vacation
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E8EC] bg-[#FAFBFC]">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-[#EF4444] rounded-full flex items-center justify-center text-white">
            DL
          </div>
          <div className="flex-1">
            <p className="text-[#0F1419]">David Lee</p>
            <p className="text-[#5E6C84]">Dec 16 - Dec 20</p>
          </div>
          <div className="px-2 py-1 bg-[#FEF3C7] text-[#F59E0B] rounded-md">
            PTO
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E8EC] bg-[#FAFBFC]">
          <div className="w-10 h-10 bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] rounded-full flex items-center justify-center text-white">
            MR
          </div>
          <div className="flex-1">
            <p className="text-[#0F1419]">Maria Rodriguez</p>
            <p className="text-[#5E6C84]">Dec 23 - Jan 3</p>
          </div>
          <div className="px-2 py-1 bg-[#ECFDF5] text-[#10B981] rounded-md">
            Vacation
          </div>
        </div>
      </div>
    </motion.div>
  );
}
