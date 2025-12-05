import { Briefcase, GraduationCap, MapPin, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export function CandidateCard() {
  const strengths = [
    'Strong technical background in React & TypeScript',
    'Leadership experience managing 5-person team',
    'Excellent cultural fit based on values assessment'
  ];

  const risks = [
    'Limited experience with our tech stack (Go)',
    'Seeking remote-only (we prefer hybrid)'
  ];

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white">SK</span>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-slate-50">Sarah Kim</h3>
            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
              92% Fit
            </div>
          </div>
          <p className="text-slate-400 mb-3">Senior Frontend Engineer</p>
          <div className="flex flex-wrap gap-3 text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>8 years exp.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>MIT, CS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Strengths</span>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400">Considerations</span>
          </div>
          <ul className="space-y-2">
            {risks.map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-300">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
          View Candidate
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors">
          Schedule Interview
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors">
          Add to Onboarding
        </button>
      </div>
    </div>
  );
}
