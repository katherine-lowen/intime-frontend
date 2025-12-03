import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ActivityItemProps {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  accentColor: 'blue' | 'purple' | 'emerald' | 'amber';
}

const accentStyles = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
    text: 'text-blue-600',
    border: 'border-blue-100/60'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
    text: 'text-purple-600',
    border: 'border-purple-100/60'
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    text: 'text-emerald-600',
    border: 'border-emerald-100/60'
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
    text: 'text-amber-600',
    border: 'border-amber-100/60'
  }
};

export function ActivityItem({
  type,
  title,
  description,
  timestamp,
  icon,
  accentColor
}: ActivityItemProps) {
  const styles = accentStyles[accentColor];

  return (
    <div className="group relative">
      <button className="w-full flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-all text-left border border-transparent hover:border-slate-200/60">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2.5 ${styles.bg} ${styles.text} rounded-xl mt-0.5 border ${styles.border} shadow-sm`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-900 text-sm font-medium">{title}</span>
            <span className="text-slate-500 text-xs whitespace-nowrap font-medium">
              {timestamp}
            </span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
          <button className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium">
            <span>View raw</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </button>
    </div>
  );
}