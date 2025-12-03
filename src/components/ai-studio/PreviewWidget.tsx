import { Sparkles, TrendingUp, CheckCircle2, Activity } from 'lucide-react';

export function PreviewWidget() {
  return (
    <div className="relative">
      {/* Enhanced glow effect */}
      <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-3xl opacity-60 animate-pulse-slow" />
      
      {/* Main dark glass panel */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 shadow-[0_20px_70px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] border border-gray-700/50 overflow-hidden">
        {/* Floating particles effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
        
        {/* Top bar with live badge */}
        <div className="relative flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm text-gray-300">AI Studio Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            <span className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-xs text-green-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Content sections with animations */}
        <div className="relative space-y-5">
          {/* AI-written JD */}
          <div className="group rounded-2xl bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 p-5 hover:border-gray-600/60 transition-all duration-300">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-gray-200 mb-1.5">AI-written job description</h4>
                <p className="text-xs text-gray-400">
                  Senior Product Designer · Full-time · Remote
                </p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-gray-400 pl-13">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>5+ years experience in product design</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>Strong portfolio in B2B SaaS</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/40 mt-1.5 flex-shrink-0" />
                <span className="text-gray-500">Figma and design systems expertise</span>
              </div>
            </div>
          </div>

          {/* Candidate ranking */}
          <div className="group rounded-2xl bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 p-5 hover:border-gray-600/60 transition-all duration-300">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-gray-200 mb-1">Candidate ranking</h4>
                <p className="text-xs text-gray-400">3 candidates analyzed</p>
              </div>
            </div>
            <div className="space-y-3 pl-13">
              {[
                { name: 'Sarah Chen', score: 94, color: 'from-indigo-500 to-purple-500' },
                { name: 'Marcus Reid', score: 87, color: 'from-indigo-500 to-purple-500' },
                { name: 'Ana Costa', score: 82, color: 'from-indigo-500/80 to-purple-500/80' }
              ].map((candidate, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-gray-700/60 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${candidate.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${candidate.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 tabular-nums w-10">{candidate.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Onboarding milestones */}
          <div className="group rounded-2xl bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 p-5 hover:border-gray-600/60 transition-all duration-300">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-gray-200 mb-1">Onboarding milestones</h4>
                <p className="text-xs text-gray-400">30-60-90 day plan</p>
              </div>
            </div>
            <div className="space-y-2.5 text-xs text-gray-400 pl-13">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Complete system access setup</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Meet key stakeholders</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-gray-600 flex-shrink-0" />
                <span>Ship first project milestone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom label with shimmer */}
        <div className="relative mt-8 pt-6 border-t border-gray-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
              Powered by event data
            </span>
            <span className="text-xs text-gray-600">Updated 2s ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
