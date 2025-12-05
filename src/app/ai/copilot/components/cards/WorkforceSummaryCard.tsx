import { Users, Briefcase, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export function WorkforceSummaryCard() {
  const metrics = [
    {
      label: 'Total Headcount',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'indigo'
    },
    {
      label: 'Active Roles',
      value: '8',
      change: '+3',
      trend: 'up',
      icon: Briefcase,
      color: 'violet'
    },
    {
      label: 'Avg. Time to Hire',
      value: '24d',
      change: '-4d',
      trend: 'down',
      icon: Clock,
      color: 'emerald'
    },
    {
      label: 'Budget Utilized',
      value: '78%',
      change: '+5%',
      trend: 'neutral',
      icon: DollarSign,
      color: 'amber'
    }
  ];

  return (
    <div className="ai-card rounded-3xl p-8 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-slate-50 text-[17px] mb-2">
          Workforce Summary — Q4 2024
        </h3>
        <p className="text-slate-400 text-[14px] leading-relaxed">
          Your organization is growing steadily with strong hiring momentum across Engineering and Sales.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : null;
          
          return (
            <div
              key={index}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-700/30 hover:border-slate-600/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-${metric.color}-500/10 border border-${metric.color}-500/20`}>
                  <Icon className={`w-4.5 h-4.5 text-${metric.color}-400`} strokeWidth={2} />
                </div>
                {TrendIcon && (
                  <div className={`flex items-center gap-1 ${
                    metric.trend === 'up' ? 'text-emerald-400' : 
                    metric.trend === 'down' ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    <TrendIcon className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="text-[13px]">{metric.change}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-[13px]">{metric.label}</p>
                <p className="text-slate-50 text-[24px] tracking-tight">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Actions */}
      <div className="flex gap-3">
        <button className="btn-primary">
          View Full Report
        </button>
        <button className="btn-secondary">
          Export Data
        </button>
      </div>
    </div>
  );
}
