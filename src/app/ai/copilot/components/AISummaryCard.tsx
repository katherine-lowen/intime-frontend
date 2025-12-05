import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export function AISummaryCard() {
  const stats = [
    { label: 'Total Headcount', value: '247', change: '+12%', icon: Users, trend: 'up' },
    { label: 'Active Roles', value: '8', change: '+3', icon: Calendar, trend: 'up' },
    { label: 'Avg. Time to Hire', value: '24d', change: '-4d', icon: TrendingUp, trend: 'down' },
    { label: 'Budget Utilized', value: '78%', change: '+5%', icon: DollarSign, trend: 'neutral' }
  ];

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-slate-100 mb-1">Workforce Summary - Q4 2024</h3>
          <p className="text-slate-400">
            Your organization is growing steadily with strong hiring momentum across Engineering and Sales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-slate-400">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-50">{stat.value}</span>
                <span className={`${
                  stat.trend === 'up' ? 'text-green-400' : 
                  stat.trend === 'down' ? 'text-red-400' : 
                  'text-slate-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
          View Full Report
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors">
          Export Data
        </button>
      </div>
    </div>
  );
}
