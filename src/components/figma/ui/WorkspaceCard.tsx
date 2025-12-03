import React from 'react';
import { ArrowRight } from 'lucide-react';

interface WorkspaceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats: string;
  accentColor: 'blue' | 'purple' | 'emerald' | 'amber';
}

const accentStyles = {
  blue: {
    bg: 'from-blue-500/10 to-blue-600/10',
    text: 'text-blue-600',
    hover: 'group-hover:from-blue-500/20 group-hover:to-blue-600/20',
    ring: 'ring-blue-500/10'
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-600/10',
    text: 'text-purple-600',
    hover: 'group-hover:from-purple-500/20 group-hover:to-purple-600/20',
    ring: 'ring-purple-500/10'
  },
  emerald: {
    bg: 'from-emerald-500/10 to-emerald-600/10',
    text: 'text-emerald-600',
    hover: 'group-hover:from-emerald-500/20 group-hover:to-emerald-600/20',
    ring: 'ring-emerald-500/10'
  },
  amber: {
    bg: 'from-amber-500/10 to-amber-600/10',
    text: 'text-amber-600',
    hover: 'group-hover:from-amber-500/20 group-hover:to-amber-600/20',
    ring: 'ring-amber-500/10'
  }
};

export function WorkspaceCard({
  title,
  description,
  icon,
  stats,
  accentColor
}: WorkspaceCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <button className="group glass-surface rounded-3xl p-8 shadow-glass hover:shadow-glass-lg transition-all duration-500 text-left w-full relative overflow-hidden">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} ${styles.hover} transition-all duration-500`} />
      
      <div className="relative space-y-6">
        {/* Icon and Arrow */}
        <div className="flex items-start justify-between">
          <div className={`p-4 bg-gradient-to-br ${styles.bg} ${styles.text} rounded-2xl transition-all duration-500 ring-1 ${styles.ring} inner-glow group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>
          <div className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-2 transition-all duration-500">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-slate-900 text-xl font-semibold">{title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
          </div>
          <div className="text-slate-500 text-xs font-medium pt-2">
            {stats}
          </div>
        </div>
      </div>
    </button>
  );
}
