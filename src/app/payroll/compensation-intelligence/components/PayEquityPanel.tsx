import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, Sparkles } from 'lucide-react';

const equityData = [
  { group: 'L3 Eng (M)', value: 142000, color: '#6366f1' },
  { group: 'L3 Eng (F)', value: 125000, color: '#ec4899' },
  { group: 'L4 PM (M)', value: 158000, color: '#6366f1' },
  { group: 'L4 PM (F)', value: 154000, color: '#ec4899' },
  { group: 'L2 Sales (M)', value: 98000, color: '#6366f1' },
  { group: 'L2 Sales (F)', value: 102000, color: '#ec4899' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg">
        <p className="text-slate-900">{payload[0].payload.group}</p>
        <p className="text-slate-600 text-sm">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function PayEquityPanel() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Chart */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-8">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-1">Pay Equity Overview</h2>
          <p className="text-slate-600">AI detects compensation disparities across comparable roles and levels.</p>
        </div>

        <div className="mb-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-sm text-slate-700">Male</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-sm text-slate-700">Female</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={equityData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="group" 
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {equityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Right: Key Findings */}
      <div className="bg-gradient-to-br from-indigo-50/80 to-violet-50/80 backdrop-blur-sm rounded-2xl border border-indigo-200/60 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-900">AI-Generated Insights</h3>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
            <p className="text-slate-700">
              Level 3 engineers are compensated <span className="text-rose-700">12% lower</span> than market-adjusted benchmark for females.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
            <p className="text-slate-700">
              Tenure-based disparities are <span className="text-emerald-700">decreasing year-over-year</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
            <p className="text-slate-700">
              <span className="text-amber-700">2 employees</span> flagged for comp realignment.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
            <p className="text-slate-700">
              Sales department shows <span className="text-emerald-700">strongest equity performance</span> at 83% score.
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 transition-colors group">
          <span>View full AI analysis</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
