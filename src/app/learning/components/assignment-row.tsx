import React from 'react';

interface AssignmentRowProps {
  learnerName: string;
  learnerAvatar?: string | null;
  pathOrCourse: string;
  due?: string | null;
  status: 'completed' | 'in-progress' | 'overdue' | 'not-started';
  onOpen?: () => void;
}

export function AssignmentRow({
  learnerName,
  learnerAvatar,
  pathOrCourse,
  due,
  status,
  onOpen,
}: AssignmentRowProps) {
  const statusConfig = {
    completed: {
      label: 'Completed',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    'in-progress': {
      label: 'In progress',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    overdue: {
      label: 'Overdue',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    'not-started': {
      label: 'Not started',
      className: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="px-4 py-3 grid grid-cols-12 gap-4 hover:bg-slate-50 transition-colors">
      <div className="col-span-4 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] flex-shrink-0">
          {learnerAvatar ? learnerAvatar : learnerName.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-slate-900 text-xs truncate">{learnerName}</span>
      </div>
      <div className="col-span-4 flex items-center">
        <span className="text-slate-700 text-xs truncate">{pathOrCourse}</span>
      </div>
      <div className="col-span-2 flex items-center">
        <span className="text-slate-600 text-xs">
          {due || "—"}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] border ${config.className}`}
        >
          {config.label}
        </span>
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Open path
          </button>
        )}
      </div>
    </div>
  );
}
