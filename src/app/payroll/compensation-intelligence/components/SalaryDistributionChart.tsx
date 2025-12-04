import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { salary: 60, count: 2 },
  { salary: 70, count: 5 },
  { salary: 80, count: 12 },
  { salary: 90, count: 18 },
  { salary: 100, count: 24 },
  { salary: 110, count: 28 },
  { salary: 120, count: 32 },
  { salary: 130, count: 26 },
  { salary: 140, count: 22 },
  { salary: 150, count: 18 },
  { salary: 160, count: 14 },
  { salary: 170, count: 9 },
  { salary: 180, count: 6 },
  { salary: 190, count: 3 },
  { salary: 200, count: 1 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg">
        <p className="text-slate-900">${payload[0].payload.salary}k salary range</p>
        <p className="text-slate-600 text-sm">{payload[0].value} employees</p>
      </div>
    );
  }
  return null;
};

export function SalaryDistributionChart() {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-slate-900 mb-1">Salary Distribution (Org vs. Market)</h2>
        <p className="text-slate-600">Based on aggregated market benchmarks for role, level, and location.</p>
      </div>

      <div className="mb-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="text-sm text-slate-700">Distribution</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-500"></div>
          <span className="text-sm text-slate-700">Company Median ($112k)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-violet-500"></div>
          <span className="text-sm text-slate-700">Market Median ($118k)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="salary" 
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `$${value}k`}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fill: '#64748b', fontSize: 12 }}
            label={{ value: 'Employees', angle: -90, position: 'insideLeft', fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            x={112} 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="6 4"
            label={{ value: 'Company', position: 'top', fill: '#10b981', fontSize: 12 }}
          />
          <ReferenceLine 
            x={118} 
            stroke="#8b5cf6" 
            strokeWidth={2}
            strokeDasharray="6 4"
            label={{ value: 'Market', position: 'top', fill: '#8b5cf6', fontSize: 12 }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#6366f1" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
