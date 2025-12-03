import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  badge?: string;
  icon: React.ReactNode;
  accentColor: 'blue' | 'purple' | 'emerald' | 'amber' | 'cyan';
}

const accentStyles = {
  blue: {
    bg: 'from-blue-500/20 to-blue-600/20',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    ring: 'ring-blue-500/20'
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/20',
    glow: 'shadow-purple-500/20',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    ring: 'ring-purple-500/20'
  },
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-600/20',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ring: 'ring-emerald-500/20'
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-600/20',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    ring: 'ring-amber-500/20'
  },
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-600/20',
    glow: 'shadow-cyan-500/20',
    text: 'text-cyan-600',
    badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    ring: 'ring-cyan-500/20'
  }
};

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  trend = 'neutral',
  badge,
  icon,
  accentColor
}: MetricCardProps) {
  const styles = accentStyles[accentColor];

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600 bg-emerald-50/80 border-emerald-200/60';
    if (trend === 'down') return 'text-rose-600 bg-rose-50/80 border-rose-200/60';
    return 'text-slate-500 bg-slate-50/80 border-slate-200/60';
  };

  return (
    <div className="glass-surface rounded-3xl p-7 shadow-glass hover:shadow-glass-lg transition-all duration-500 group relative overflow-hidden">
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`p-4 bg-gradient-to-br ${styles.bg} ${styles.text} rounded-2xl inner-glow ring-1 ${styles.ring} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
            {icon}
          </div>
          {badge && (
            <span className={`px-3 py-1.5 ${styles.badge} rounded-full text-xs font-semibold border animate-micro-bounce`}>
              {badge}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="space-y-3">
          <div className="text-slate-900 text-4xl font-semibold tracking-tight">{value}</div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-sm font-medium">{title}</span>
            {change !== undefined && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{change > 0 ? '+' : ''}{change}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <div className="text-slate-500 text-xs font-medium">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}
