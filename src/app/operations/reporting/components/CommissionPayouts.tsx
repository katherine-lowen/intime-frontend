import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

const chartData = [
  { month: 'Jan', amount: 245000 },
  { month: 'Feb', amount: 312000 },
  { month: 'Mar', amount: 289000 },
  { month: 'Apr', amount: 398000 },
  { month: 'May', amount: 425000 },
  { month: 'Jun', amount: 456000 },
];

const tableData = [
  { rep: 'Sarah Chen', team: 'Enterprise', amount: '$48,500', status: 'paid' },
  { rep: 'Michael Torres', team: 'Enterprise', amount: '$42,300', status: 'paid' },
  { rep: 'Emma Wilson', team: 'SMB', amount: '$38,900', status: 'pending' },
  { rep: 'James Park', team: 'Enterprise', amount: '$51,200', status: 'processing' },
  { rep: 'Lisa Anderson', team: 'Mid-Market', amount: '$35,600', status: 'paid' },
  { rep: 'David Kim', team: 'SMB', amount: '$29,800', status: 'pending' },
];

export function CommissionPayouts() {
  const [activeTab, setActiveTab] = useState('team');

  return (
    <div className="rounded-2xl bg-white p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#111827] mb-1">Commission Payouts</h2>
          <p className="text-[#6B7280]">Monthly commission trends</p>
        </div>
        
        {/* Segmented Control */}
        <div className="inline-flex rounded-xl bg-[#F9FAFB] p-1 border border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'team' 
                ? 'bg-white text-[#111827] shadow-[0px_1px_3px_rgba(0,0,0,0.08)]' 
                : 'text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            Team
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'individual' 
                ? 'bg-white text-[#111827] shadow-[0px_1px_3px_rgba(0,0,0,0.08)]' 
                : 'text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'forecast' 
                ? 'bg-white text-[#111827] shadow-[0px_1px_3px_rgba(0,0,0,0.08)]' 
                : 'text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            Forecast
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.4}/>
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
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.08)'
            }}
          />
          <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Table */}
      <div className="mt-6 border border-[#E5E7EB] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <th className="px-4 py-3 text-left text-[#6B7280]">Rep</th>
              <th className="px-4 py-3 text-left text-[#6B7280]">Team</th>
              <th className="px-4 py-3 text-right text-[#6B7280]">Amount</th>
              <th className="px-4 py-3 text-center text-[#6B7280]">Status</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr 
                key={index} 
                className={`border-b border-[#F3F4F6] last:border-b-0 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFF]'
                } hover:bg-[#F9FAFB]`}
              >
                <td className="px-4 py-3 text-[#111827]">{row.rep}</td>
                <td className="px-4 py-3 text-[#6B7280]">{row.team}</td>
                <td className="px-4 py-3 text-right text-[#111827]">{row.amount}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-lg ${
                    row.status === 'paid' 
                      ? 'bg-[#ECF9F3] text-[#059669]' 
                      : row.status === 'pending'
                      ? 'bg-[#FFF9E9] text-[#D97706]'
                      : 'bg-[#E9F0FF] text-[#2563EB]'
                  }`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
