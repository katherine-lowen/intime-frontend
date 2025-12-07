import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'Retention Risk', value: 65, fullMark: 100 },
  { subject: 'Workload Balance', value: 78, fullMark: 100 },
  { subject: 'Engagement Levels', value: 58, fullMark: 100 },
  { subject: 'Hiring Velocity', value: 82, fullMark: 100 },
  { subject: 'Payroll Efficiency', value: 91, fullMark: 100 }
];

export function WorkforceRadar() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-2 py-1 rounded">
          AI INSIGHT
        </span>
        <h2 className="text-[#111827]">
          Workforce Risk Radar
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <Radar
            name="Workforce Health"
            dataKey="value"
            stroke="#8B5CF6"
            fill="url(#radarGradient)"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-6 p-4 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] rounded-xl border border-[#E5E7EB]">
        <p className="text-[#6B7280]">
          <span className="text-[#111827]">Top risks today:</span> Engagement decline in Customer Success, uneven workload in Engineering.
        </p>
      </div>
    </div>
  );
}
