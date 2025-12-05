import { User, MapPin, Briefcase, GraduationCap, Star, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

export function CandidateComparisonCard() {
  const candidate = {
    name: 'Sarah Kim',
    role: 'Senior Frontend Engineer',
    location: 'San Francisco, CA',
    experience: '8 years',
    education: 'MIT, Computer Science',
    fitScore: 92,
    strengths: [
      'Strong technical background in React & TypeScript',
      'Leadership experience managing 5-person team',
      'Excellent cultural fit based on values assessment',
      'Active open source contributor (12K+ GitHub stars)'
    ],
    considerations: [
      'Limited experience with our tech stack (Go)',
      'Seeking remote-only (we prefer hybrid)'
    ]
  };

  return (
    <div className="ai-card rounded-3xl p-8 space-y-6">
      {/* Candidate Header */}
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
          <span className="text-white text-[18px]">SK</span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-slate-50 text-[18px] mb-1">
                {candidate.name}
              </h3>
              <p className="text-slate-400 text-[14px]">{candidate.role}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" strokeWidth={2} />
              <span className="text-emerald-400 text-[15px]">{candidate.fitScore}% Fit</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-slate-400 text-[13px]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{candidate.experience}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{candidate.education}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Considerations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" strokeWidth={2} />
            <span className="text-emerald-400 text-[14px]">Strengths</span>
          </div>
          <ul className="space-y-2.5">
            {candidate.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 mt-2 flex-shrink-0" />
                <span className="text-slate-300 text-[13.5px] leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Considerations */}
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4.5 h-4.5 text-amber-400" strokeWidth={2} />
            <span className="text-amber-400 text-[14px]">Considerations</span>
          </div>
          <ul className="space-y-2.5">
            {candidate.considerations.map((consideration, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-2 flex-shrink-0" />
                <span className="text-slate-300 text-[13.5px] leading-relaxed">{consideration}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Actions */}
      <div className="flex gap-3">
        <button className="btn-primary flex items-center gap-2">
          <span>View Candidate</span>
          <ExternalLink className="w-4 h-4" strokeWidth={2} />
        </button>
        <button className="btn-secondary">
          Schedule Interview
        </button>
        <button className="btn-secondary">
          Add to Onboarding
        </button>
      </div>
    </div>
  );
}
