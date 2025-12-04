import React from 'react';
import { TrendingUp, Globe, Calendar, Sparkles } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Equity + Stock Benchmarking',
    description: 'Market-competitive equity analysis',
  },
  {
    icon: Globe,
    title: 'Geo-adjusted Salary Modeling',
    description: 'Location-based compensation insights',
  },
  {
    icon: Calendar,
    title: 'Compensation Cycle Planning',
    description: 'Strategic raise and promotion planning',
  },
  {
    icon: Sparkles,
    title: 'AI-driven Raise Approvals',
    description: 'Automated approval workflows',
  },
];

export function ComingSoonFeatures() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200/60 p-8">
      <div className="mb-6">
        <h2 className="text-slate-900 mb-1">Coming Soon</h2>
        <p className="text-slate-600">Advanced features in development</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-600 mb-3">{feature.description}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
