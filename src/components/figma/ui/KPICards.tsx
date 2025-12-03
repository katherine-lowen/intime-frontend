import React from 'react';
import { Users, Briefcase, Target, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPIData {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  badge?: string;
  icon: React.ReactNode;
  orbClass: string;
}

const kpis: KPIData[] = [
  {
    title: 'Headcount',
    value: '247',
    change: 12,
    trend: 'up',
    badge: 'Live',
    icon: <Users className="w-5 h-5" />,
    orbClass: 'orb-gradient-blue'
  },
  {
    title: 'Hiring Load',
    value: '8/12',
    change: -2,
    trend: 'down',
    icon: <Briefcase className="w-5 h-5" />,
    orbClass: 'orb-gradient-purple'
  },
  {
    title: 'Engagement',
    value: '4.2',
    change: 0,
    trend: 'neutral',
    icon: <Target className="w-5 h-5" />,
    orbClass: 'orb-gradient-emerald'
  },
  {
    title: 'Time-off',
    value: '23',
    change: 5,
    trend: 'up',
    icon: <Calendar className="w-5 h-5" />,
    orbClass: 'orb-gradient-cyan'
  }
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}

function KPICard({ title, value, change, trend, badge, icon, orbClass }: KPIData) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600 bg-emerald-50/90 border-emerald-200/60';
    if (trend === 'down') return 'text-rose-600 bg-rose-50/90 border-rose-200/60';
    return 'text-slate-500 bg-slate-50/90 border-slate-200/60';
  };

  return (
    <div className="card-3d glass-panel-deep rounded-[28px] p-8 inner-reflection relative overflow-hidden group">
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Micro sparkline placeholder - subtle background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-5">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
          <path 
            d="M 0,20 L 20,15 L 40,22 L 60,10 L 80,18 L 100,12" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-blue-500"
          />
        </svg>
      </div>
      
      <div className="relative space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`p-4 ${orbClass} rounded-[20px] text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 float-3d`}>
            {icon}
          </div>
          {badge && (
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold animate-pulse">
              {badge}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="space-y-3">
          <div className="text-slate-900 text-5xl font-light tracking-tight">{value}</div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-sm font-medium">{title}</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{change > 0 ? '+' : ''}{change}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
