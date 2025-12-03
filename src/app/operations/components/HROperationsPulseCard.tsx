"use client";


import { Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function HROperationsPulseCard() {
  const metrics = [
    { label: 'Active Tasks', value: 18, icon: Clock, color: '#F59E0B', bgColor: '#FFFBEB' },
    { label: 'Completed This Week', value: 42, icon: CheckCircle2, color: '#22C55E', bgColor: '#F0FDF4' },
    { label: 'Pending Approvals', value: 7, icon: AlertCircle, color: '#EF4444', bgColor: '#FEF2F2' },
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
            <Activity className="w-5 h-5 text-[#2C6DF9]" />
          </div>
          <h2 className="text-[#0F1419]">HR Operations Pulse</h2>
        </div>
        <button className="px-3 py-1.5 text-[#5E6C84] hover:bg-[#F4F5F7] rounded-lg transition-colors">
          View All
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-[#E6E8EC] bg-[#FAFBFC] hover:border-[#2C6DF9]/20 transition-colors"
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: metric.bgColor }}
            >
              <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
            </div>
            <div className="text-[28px] text-[#0F1419] mb-1">{metric.value}</div>
            <div className="text-[#5E6C84]">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-6 border-t border-[#E6E8EC]">
        <h3 className="text-[#0F1419] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F4F5F7] transition-colors">
            <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
            <div className="flex-1">
              <p className="text-[#0F1419]">Leave request approved</p>
              <p className="text-[#5E6C84]">Sarah Chen · 2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F4F5F7] transition-colors">
            <div className="w-2 h-2 bg-[#2C6DF9] rounded-full"></div>
            <div className="flex-1">
              <p className="text-[#0F1419]">New hire onboarded</p>
              <p className="text-[#5E6C84]">Marcus Johnson · 5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
