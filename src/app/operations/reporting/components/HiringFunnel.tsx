import { AlertCircle } from 'lucide-react';

const funnelData = [
  { stage: 'Applications', count: 2847, percentage: 100, color: '#3B82F6', width: 100 },
  { stage: 'Phone Screen', count: 856, percentage: 30, color: '#60A5FA', width: 85 },
  { stage: 'Technical', count: 411, percentage: 48, color: '#93C5FD', width: 70 },
  { stage: 'Final Round', count: 287, percentage: 70, color: '#BFDBFE', width: 55 },
  { stage: 'Offers', count: 189, percentage: 66, color: '#DBEAFE', width: 40 },
  { stage: 'Accepted', count: 164, percentage: 87, color: '#EFF6FF', width: 30 },
];

export function HiringFunnel() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E7EB]">
      <div className="mb-6">
        <h2 className="text-[#111827] mb-1">Hiring Funnel Analytics</h2>
        <p className="text-[#6B7280]">Conversion rates across hiring stages</p>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-3 mb-6">
        {funnelData.map((stage, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-32 text-right">
              <span className="text-[#374151]">{stage.stage}</span>
            </div>
            <div className="flex-1">
              <div 
                className="rounded-lg py-4 px-6 flex items-center justify-between transition-all hover:shadow-[0px_2px_6px_rgba(0,0,0,0.08)]"
                style={{ 
                  backgroundColor: stage.color,
                  width: `${stage.width}%`,
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
              >
                <span className="text-[#1E40AF]">{stage.count.toLocaleString()} candidates</span>
                {index > 0 && (
                  <span className="text-[#1E40AF] px-2 py-1 rounded-md bg-white/50">
                    {stage.percentage}% conversion
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Card */}
      <div className="rounded-xl bg-gradient-to-r from-[#FFF9E9] to-[#FFFBEB] border border-[#FDE68A] p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <div>
          <p className="text-[#92400E] mb-1">Bottleneck Detected</p>
          <p className="text-[#B45309]">Bottleneck detected at Phone Screen (48% conversion). Consider updating interview rubric.</p>
        </div>
      </div>
    </div>
  );
}
