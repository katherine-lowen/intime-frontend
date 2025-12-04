import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  progressBar?: number;
  badge?: {
    text: string;
    variant: 'danger' | 'warning' | 'success';
  };
}

export function StatCard({ title, value, caption, icon: Icon, progressBar, badge }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <span className="text-slate-600 text-xs">{title}</span>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      
      <div className="flex items-end gap-2 mb-3">
        <span className="text-slate-900 text-3xl tracking-tight">{value}</span>
        {badge && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] mb-1 ${
              badge.variant === 'danger'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : badge.variant === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {progressBar !== undefined && (
        <div className="mb-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${progressBar}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-slate-500 text-xs leading-relaxed">{caption}</p>
    </div>
  );
}
