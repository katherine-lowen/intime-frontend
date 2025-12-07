import { Users, DollarSign, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  bgColor: string;
  iconColor: string;
}

function KPICard({ icon, label, value, trend, trendUp, bgColor, iconColor }: KPICardProps) {
  return (
    <div className="rounded-2xl p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB]" style={{ background: bgColor }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: iconColor }}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${trendUp ? 'bg-[#ECF9F3] text-[#059669]' : 'bg-[#FFECEC] text-[#DC2626]'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-[#111827]">{value}</div>
        <p className="text-[#6B7280]">{label}</p>
      </div>
    </div>
  );
}

export function KPICards() {
  const cards = [
    {
      icon: <Users className="w-5 h-5 text-[#3B82F6]" />,
      label: 'Total Headcount',
      value: '1,247',
      trend: '+3%',
      trendUp: true,
      bgColor: '#E9F0FF',
      iconColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: <DollarSign className="w-5 h-5 text-[#8B5CF6]" />,
      label: 'Monthly Payroll Spend',
      value: '$8.2M',
      trend: '+5%',
      trendUp: true,
      bgColor: '#F1EDFF',
      iconColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-[#10B981]" />,
      label: 'Offer Acceptance Rate',
      value: '87%',
      trend: '+2%',
      trendUp: true,
      bgColor: '#ECF9F3',
      iconColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: <Clock className="w-5 h-5 text-[#F59E0B]" />,
      label: 'Avg Days to Fill',
      value: '28',
      trend: '-8%',
      trendUp: true,
      bgColor: '#FFF9E9',
      iconColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      icon: <TrendingDown className="w-5 h-5 text-[#EF4444]" />,
      label: 'Turnover Rate',
      value: '11.2%',
      trend: '-1%',
      trendUp: true,
      bgColor: '#FFECEC',
      iconColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <KPICard key={index} {...card} />
      ))}
    </div>
  );
}
