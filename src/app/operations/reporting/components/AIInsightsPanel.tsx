import { Sparkles, TrendingUp, AlertTriangle, Users } from 'lucide-react';

const insights = [
  {
    icon: <TrendingUp className="w-4 h-4 text-[#3B82F6]" />,
    text: 'Payroll spend projected to rise 8.4% next month.',
    color: '#E9F0FF',
    dotColor: '#3B82F6'
  },
  {
    icon: <AlertTriangle className="w-4 h-4 text-[#EF4444]" />,
    text: 'Turnover risk detected in Customer Success.',
    color: '#FFECEC',
    dotColor: '#EF4444'
  },
  {
    icon: <TrendingUp className="w-4 h-4 text-[#10B981]" />,
    text: 'Sales rep commissions expected to spike mid-quarter.',
    color: '#ECF9F3',
    dotColor: '#10B981'
  },
  {
    icon: <Users className="w-4 h-4 text-[#8B5CF6]" />,
    text: 'Engineering headcount 12% above industry benchmark.',
    color: '#F1EDFF',
    dotColor: '#8B5CF6'
  },
  {
    icon: <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />,
    text: 'Q2 hiring velocity 23% slower than target.',
    color: '#FFF9E9',
    dotColor: '#F59E0B'
  },
];

export function AIInsightsPanel() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-[#F9FAFB] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB]">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-[0px_2px_8px_rgba(59,130,246,0.2)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[#111827] mb-1">AI Organization Insights</h2>
            <p className="text-[#6B7280]">Intelligent patterns across people data</p>
          </div>
        </div>
        <span className="text-[#9CA3AF]">Last updated 2 hours ago</span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="rounded-xl p-4 border border-[#E5E7EB] bg-white hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)] transition-all"
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: insight.color }}
              >
                {insight.icon}
              </div>
              <div className="flex-1">
                <p className="text-[#374151]">{insight.text}</p>
              </div>
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                style={{ backgroundColor: insight.dotColor }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className="w-full mt-4 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors">
        View All Insights
      </button>
    </div>
  );
}
