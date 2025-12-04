import React from 'react';
import { Briefcase, TrendingUp, Scale, AlertCircle, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  icon: 'briefcase' | 'trending-up' | 'scale' | 'alert-circle' | 'sparkles';
  label: string;
  value: string;
  trend: { value: string; type: 'positive' | 'negative' | 'warning' } | null;
}

export function KPICard({ icon, label, value, trend }: KPICardProps) {
  const icons = {
    'briefcase': Briefcase,
    'trending-up': TrendingUp,
    'scale': Scale,
    'alert-circle': AlertCircle,
    'sparkles': Sparkles,
  };

  const Icon = icons[icon];

  const gradients = {
    'briefcase': 'from-indigo-50 to-indigo-100/50',
    'trending-up': 'from-emerald-50 to-emerald-100/50',
    'scale': 'from-amber-50 to-amber-100/50',
    'alert-circle': 'from-rose-50 to-rose-100/50',
    'sparkles': 'from-violet-50 to-violet-100/50',
  };

  const iconColors = {
    'briefcase': 'text-indigo-600',
    'trending-up': 'text-emerald-600',
    'scale': 'text-amber-600',
    'alert-circle': 'text-rose-600',
    'sparkles': 'text-violet-600',
  };

  const trendColors = {
    positive: 'text-emerald-700 bg-emerald-50',
    negative: 'text-rose-700 bg-rose-50',
    warning: 'text-amber-700 bg-amber-50',
  };

  return (
    <div className={`bg-gradient-to-br ${gradients[icon]} backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-6 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
      <div className="relative">
        <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center mb-4 ${iconColors[icon]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-slate-600 text-sm mb-1">{label}</div>
        <div className="flex items-end justify-between">
          <div className="text-slate-900">{value}</div>
          {trend && (
            <div className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${trendColors[trend.type]}`}>
              {trend.type === 'positive' && <ArrowUp className="w-3 h-3" />}
              {trend.type === 'negative' && <ArrowDown className="w-3 h-3" />}
              {trend.value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
