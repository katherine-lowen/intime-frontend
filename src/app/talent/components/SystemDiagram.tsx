import { ArrowRight, GitBranch } from 'lucide-react';

export function SystemDiagram() {
  const connections = [
    {
      from: 'Recruiting',
      to: 'Headcount Planning',
      description: 'Pipeline to capacity',
    },
    {
      from: 'Reviews',
      to: 'Performance Insights',
      description: 'Calibration to analytics',
    },
    {
      from: 'Goals & Learning',
      to: 'Role Changes & Onboarding',
      description: 'Growth to mobility',
    },
    {
      from: 'Surveys & Comp Bands',
      to: 'Retention Insights',
      description: 'Sentiment + fairness',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E8EAED] p-8 shadow-sm">
      <div className="flex items-center mb-6">
        <GitBranch className="w-5 h-5 text-[#2C6DF9] mr-3" />
        <h2 className="text-[#0F1419]">How this connects to the rest of Intime</h2>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {connections.map((connection, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-[#F4F5F7] to-transparent border border-[#E8EAED]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-[#0F1419]">{connection.from}</span>
                <ArrowRight className="w-4 h-4 text-[#5E6C84] flex-shrink-0" />
                <span className="text-sm text-[#0F1419]">{connection.to}</span>
              </div>
              <p className="text-xs text-[#5E6C84]">{connection.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[#E8EAED]">
        <p className="text-sm text-[#5E6C84] leading-relaxed">
          Every module in Talent Overview feeds into your people operations system—from recruiting to retention, 
          everything is connected to give you a complete picture of organizational health.
        </p>
      </div>
    </div>
  );
}
