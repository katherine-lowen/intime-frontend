import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { month: 'Jan', headcount: 198, engineering: 85, sales: 45, operations: 68 },
  { month: 'Feb', headcount: 205, engineering: 88, sales: 48, operations: 69 },
  { month: 'Mar', headcount: 212, engineering: 92, sales: 50, operations: 70 },
  { month: 'Apr', headcount: 218, engineering: 95, sales: 52, operations: 71 },
  { month: 'May', headcount: 225, engineering: 98, sales: 55, operations: 72 },
  { month: 'Jun', headcount: 232, engineering: 102, sales: 57, operations: 73 },
  { month: 'Jul', headcount: 235, engineering: 103, sales: 59, operations: 73 },
  { month: 'Aug', headcount: 238, engineering: 105, sales: 60, operations: 73 },
  { month: 'Sep', headcount: 242, engineering: 107, sales: 62, operations: 73 },
  { month: 'Oct', headcount: 247, engineering: 110, sales: 64, operations: 73 }
];

export function OrgSnapshotChart() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-slate-50">Headcount Trend</h3>
            <p className="text-slate-400">Organization growth over time</p>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-slate-400">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-slate-400">Engineering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-slate-400">Sales</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              tick={{ fill: '#94a3b8' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#94a3b8' }}
              tickLine={{ stroke: '#334155' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="headcount" 
              stroke="#6366f1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorHeadcount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <p className="text-slate-400 mb-1">Growth Rate</p>
          <p className="text-slate-50">+24.7%</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <p className="text-slate-400 mb-1">Avg/Month</p>
          <p className="text-slate-50">+4.9</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <p className="text-slate-400 mb-1">Projection EOY</p>
          <p className="text-slate-50">262</p>
        </div>
      </div>
    </div>
  );
}
