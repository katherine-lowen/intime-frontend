import React from 'react';
import { GitBranch } from 'lucide-react';

interface LearningPathItemProps {
  name: string;
  audience: string;
  useCase: string;
  courseCount: number;
  duration: string;
}

export function LearningPathItem({
  name,
  audience,
  useCase,
  courseCount,
  duration,
}: LearningPathItemProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
            <h3 className="text-slate-900 text-sm">{name}</h3>
          </div>
          <p className="text-slate-600 text-xs">
            {audience} · {useCase}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-3">
        <span>{courseCount} courses</span>
        <span>•</span>
        <span>{duration} total</span>
      </div>
    </div>
  );
}
