import { AlertTriangle, TrendingUp, PhoneCall, DollarSign, Activity, Users } from 'lucide-react';

const insights = [
  {
    icon: AlertTriangle,
    title: 'Retention Risk',
    value: '3 high-risk employees flagged',
    bg: 'bg-gradient-to-br from-[#FEF3F2] to-[#FEE2E2]',
    iconColor: 'text-[#EF4444]'
  },
  {
    icon: TrendingUp,
    title: 'Headcount Forecast',
    value: '12% over plan by Q3',
    bg: 'bg-gradient-to-br from-[#F0F9FF] to-[#DBEAFE]',
    iconColor: 'text-[#3B82F6]'
  },
  {
    icon: PhoneCall,
    title: 'Hiring Bottleneck',
    value: 'Phone screen drop-off detected',
    bg: 'bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A]',
    iconColor: 'text-[#EAB308]'
  },
  {
    icon: DollarSign,
    title: 'Payroll Anomaly',
    value: '$86k variance predicted',
    bg: 'bg-gradient-to-br from-[#FDF4FF] to-[#FAE8FF]',
    iconColor: 'text-[#A855F7]'
  },
  {
    icon: Activity,
    title: 'Engagement Shift',
    value: 'Ops team shows 14% decline',
    bg: 'bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1]',
    iconColor: 'text-[#14B8A6]'
  },
  {
    icon: Users,
    title: 'Team Velocity',
    value: 'Engineering output +18%',
    bg: 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]',
    iconColor: 'text-[#8B5CF6]'
  }
];

export function InsightsStrip() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {insights.map((insight) => {
        const Icon = insight.icon;
        return (
          <div
            key={insight.title}
            className={`${insight.bg} rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
          >
            <div className="absolute top-2 right-2 text-[10px] text-[#6B7280]">
              ✨
            </div>
            <Icon className={`w-5 h-5 ${insight.iconColor} mb-3`} />
            <div className="text-[#6B7280] mb-1">
              {insight.title}
            </div>
            <div className="text-[#111827]">
              {insight.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
