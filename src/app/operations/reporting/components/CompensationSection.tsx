import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const donutData = [
  { name: 'Engineering', value: 3200000, color: '#3B82F6' },
  { name: 'Sales', value: 2100000, color: '#8B5CF6' },
  { name: 'Product', value: 1400000, color: '#14B8A6' },
  { name: 'Marketing', value: 800000, color: '#F59E0B' },
  { name: 'Operations', value: 700000, color: '#EF4444' },
];

const tableData = [
  { role: 'Engineering', count: 342, avgComp: '$145,000', total: '$49.6M', isHighest: true },
  { role: 'Sales', count: 215, avgComp: '$128,000', total: '$27.5M', isHighest: false },
  { role: 'Product', count: 124, avgComp: '$138,000', total: '$17.1M', isHighest: false },
  { role: 'Marketing', count: 89, avgComp: '$112,000', total: '$10.0M', isHighest: false },
  { role: 'Operations', count: 156, avgComp: '$95,000', total: '$14.8M', isHighest: false },
];

export function CompensationSection() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB]">
      <div className="mb-6">
        <h2 className="text-[#111827] mb-1">Payroll & Compensation</h2>
        <p className="text-[#6B7280]">Monthly spend by department</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`}
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.08)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="space-y-2 mt-4">
            {donutData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[#374151]">{item.name}</span>
                </div>
                <span className="text-[#6B7280]">${(item.value / 1000000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="px-4 py-3 text-left text-[#6B7280]">Role</th>
                  <th className="px-4 py-3 text-right text-[#6B7280]">Count</th>
                  <th className="px-4 py-3 text-right text-[#6B7280]">Avg Comp</th>
                  <th className="px-4 py-3 text-right text-[#6B7280]">Total</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-[#F3F4F6] last:border-b-0 ${row.isHighest ? 'bg-[#E9F0FF]' : 'bg-white hover:bg-[#F9FAFB]'}`}
                  >
                    <td className="px-4 py-3 text-[#111827]">{row.role}</td>
                    <td className="px-4 py-3 text-right text-[#6B7280]">{row.count}</td>
                    <td className="px-4 py-3 text-right text-[#6B7280]">{row.avgComp}</td>
                    <td className="px-4 py-3 text-right text-[#111827]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
