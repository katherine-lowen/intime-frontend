import React from 'react';
import { PlayCircle, Users } from 'lucide-react';

interface CourseCardProps {
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  learnerCount: number;
  completionRate: number;
}

export function CourseCard({
  title,
  category,
  difficulty,
  duration,
  learnerCount,
  completionRate,
}: CourseCardProps) {
  const difficultyConfig = {
    Beginner: 'bg-green-50 text-green-700 border-green-200',
    Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
    Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <PlayCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 group-hover:text-indigo-700 transition-colors" />
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${difficultyConfig[difficulty]}`}
        >
          {difficulty}
        </span>
      </div>

      <h3 className="text-slate-900 text-sm mb-2 line-clamp-2">{title}</h3>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-600 text-[11px]">{category}</span>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-600">{duration}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-600">
              <Users className="w-3 h-3" />
              <span>{learnerCount} learners</span>
            </div>
            <span className="text-slate-500">·</span>
            <span className="text-indigo-600">{completionRate}% completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
