import { Calendar, Target, DollarSign, Scale, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const actions = [
  {
    icon: Calendar,
    text: 'Schedule a stay interview with 2 CS reps trending downward',
    priority: 'High',
    color: 'bg-[#EF4444]'
  },
  {
    icon: Target,
    text: 'Improve phone screen rubric to reduce 48% drop-off',
    priority: 'High',
    color: 'bg-[#EF4444]'
  },
  {
    icon: DollarSign,
    text: 'Review payroll outliers ahead of next month\'s cycle',
    priority: 'Medium',
    color: 'bg-[#F59E0B]'
  },
  {
    icon: Scale,
    text: 'Rebalance workload across engineering pods',
    priority: 'High',
    color: 'bg-[#EF4444]'
  },
  {
    icon: Calendar,
    text: 'Schedule quarterly engagement pulse for all teams',
    priority: 'Medium',
    color: 'bg-[#F59E0B]'
  },
  {
    icon: Target,
    text: 'Review compensation bands for customer success roles',
    priority: 'Low',
    color: 'bg-[#10B981]'
  }
];

export function AIActions() {
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleAction = (index: number) => {
    if (completed.includes(index)) {
      setCompleted(completed.filter(i => i !== index));
    } else {
      setCompleted([...completed, index]);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-2 py-1 rounded">
          AI RECOMMENDED
        </span>
        <h2 className="text-[#111827]">
          AI Actions You Can Take Today
        </h2>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isCompleted = completed.includes(index);
          
          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-[#F0FDF4] border-[#86EFAC]'
                  : 'bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#D1D5DB]'
              }`}
            >
              <button
                onClick={() => toggleAction(index)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-[#10B981] border-[#10B981]'
                    : 'bg-white border-[#D1D5DB] hover:border-[#9CA3AF]'
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
              
              <Icon className={`w-5 h-5 flex-shrink-0 ${isCompleted ? 'text-[#10B981]' : 'text-[#6B7280]'}`} />
              
              <span className={`flex-1 ${isCompleted ? 'line-through text-[#9CA3AF]' : 'text-[#111827]'}`}>
                {action.text}
              </span>
              
              <span className={`${action.color} text-white px-3 py-1 rounded-full text-[11px] flex-shrink-0`}>
                {action.priority}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
