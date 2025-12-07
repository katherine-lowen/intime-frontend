import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const retentionData = [
  { month: 'Jan', score: 82 },
  { month: 'Feb', score: 79 },
  { month: 'Mar', score: 75 },
  { month: 'Apr', score: 71 },
  { month: 'May', score: 68 },
  { month: 'Jun', score: 65 }
];

const hiringData = [
  { stage: 'Applied', count: 248 },
  { stage: 'Screen', count: 128 },
  { stage: 'Phone', count: 52 },
  { stage: 'Onsite', count: 28 },
  { stage: 'Offer', count: 12 }
];

const capacityData = [
  { team: 'Eng', load: 94, color: '#EF4444' },
  { team: 'Design', load: 67, color: '#3B82F6' },
  { team: 'CS', load: 88, color: '#F59E0B' },
  { team: 'Sales', load: 52, color: '#10B981' },
  { team: 'Ops', load: 43, color: '#6366F1' }
];

const payrollData = [
  { month: 'Jan', amount: 482 },
  { month: 'Feb', amount: 498 },
  { month: 'Mar', amount: 512 },
  { month: 'Apr', amount: 526 },
  { month: 'May', amount: 548 },
  { month: 'Jun', amount: 612 }
];

interface InsightPanelProps {
  title: string;
  type: 'retention' | 'hiring' | 'capacity' | 'payroll';
}

export function InsightPanel({ title, type }: InsightPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getContent = () => {
    switch (type) {
      case 'retention':
        return (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#FEF3F2] rounded-lg border border-[#FEE2E2]">
                <div>
                  <div className="text-[#6B7280]">Sarah Chen</div>
                  <div className="text-[#EF4444]">Engagement score: 42/100</div>
                </div>
                <div className="px-2 py-1 bg-[#EF4444] text-white rounded text-[11px]">HIGH RISK</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FEF3F2] rounded-lg border border-[#FEE2E2]">
                <div>
                  <div className="text-[#6B7280]">Marcus Liu</div>
                  <div className="text-[#EF4444]">Engagement score: 38/100</div>
                </div>
                <div className="px-2 py-1 bg-[#EF4444] text-white rounded text-[11px]">HIGH RISK</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] rounded-xl border border-[#E5E7EB]">
              <p className="text-[#6B7280]">
                AI detected a <span className="text-[#111827]">downward engagement trend</span> in the Customer Success team over the last 90 days. Recommend scheduling 1:1s with high-risk individuals and reviewing workload distribution.
              </p>
            </div>
          </>
        );
      
      case 'hiring':
        return (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hiringData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="stage" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A] rounded-xl border border-[#FDE047]">
              <p className="text-[#78716C]">
                <span className="text-[#713F12]">48% drop-off rate</span> detected between phone screens and onsite interviews. Recommend refining screening criteria or adjusting interview process.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF]">Avg Time-to-Fill</div>
                <div className="text-[#111827]">38 days</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF]">Open Roles</div>
                <div className="text-[#111827]">14 positions</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF]">Pipeline Health</div>
                <div className="text-[#EF4444]">At Risk</div>
              </div>
            </div>
          </>
        );
      
      case 'capacity':
        return (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={capacityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis dataKey="team" type="category" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="load" radius={[0, 8, 8, 0]}>
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-gradient-to-br from-[#FEF3F2] to-[#FEE2E2] rounded-xl border border-[#FEE2E2]">
              <p className="text-[#6B7280]">
                <span className="text-[#111827]">Engineering team is at 94% capacity</span> — critical overload detected. Recommend redistributing 3 projects to Design team (currently at 67%) or pausing new feature work.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                <span className="text-[#6B7280]">Overloaded ({'>'}85%)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <span className="text-[#6B7280]">Available ({'<'}70%)</span>
              </div>
            </div>
          </>
        );
      
      case 'payroll':
        return (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={payrollData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-gradient-to-br from-[#FDF4FF] to-[#FAE8FF] rounded-xl border border-[#F3E8FF]">
              <p className="text-[#6B7280]">
                AI forecasts a <span className="text-[#111827]">$86k payroll variance</span> next month due to planned new hires and merit increases. Recommend budget adjustment or staggered start dates.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF]">Current Monthly</div>
                <div className="text-[#111827]">$548k</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF]">Predicted Next Month</div>
                <div className="text-[#8B5CF6]">$612k</div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-2 py-1 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI INSIGHT
          </span>
          <h3 className="text-[#111827]">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#6B7280]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#6B7280]" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          {getContent()}
        </div>
      )}
    </div>
  );
}