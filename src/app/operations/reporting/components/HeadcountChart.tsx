import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles } from 'lucide-react';

const data = [
  { month: 'Jan', actual: 980, planned: 1000 },
  { month: 'Feb', actual: 1020, planned: 1050 },
  { month: 'Mar', actual: 1080, planned: 1100 },
  { month: 'Apr', actual: 1150, planned: 1150 },
  { month: 'May', actual: 1200, planned: 1200 },
  { month: 'Jun', actual: 1247, planned: 1250 },
  { month: 'Jul', actual: 1247, planned: 1300 },
  { month: 'Aug', actual: 1247, planned: 1350 },
];

export function HeadcountChart() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB]">
      <div className="mb-6">
        <h2 className="text-[#111827] mb-1">Headcount Planning</h2>
        <p className="text-[#6B7280]">Actual vs planned headcount trajectory</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
            </linearGradient>
            <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.08)'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorActual)" 
            name="Actual"
          />
          <Area 
            type="monotone" 
            dataKey="planned" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorPlanned)" 
            name="Planned"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* AI Insight Banner */}
      <div className="mt-6 rounded-xl bg-gradient-to-r from-[#E9F0FF] to-[#F1EDFF] border border-[#E5E7EB] p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#3B82F6]" />
        </div>
        <div>
          <p className="text-[#374151] mb-1">AI Insight</p>
          <p className="text-[#6B7280]">Engineering projected to exceed headcount plan by Q2. Sales is 4 roles behind plan.</p>
        </div>
      </div>
    </div>
  );
}
