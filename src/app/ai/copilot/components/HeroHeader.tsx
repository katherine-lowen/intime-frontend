import { Sparkles } from 'lucide-react';

export function HeroHeader() {
  return (
    <div className="relative border-b border-slate-800/50">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/10 to-transparent pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto px-8 py-12">
        <div className="flex flex-col items-center text-center">
          {/* Glowing icon */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-400/40 flex items-center justify-center icon-glow">
              <Sparkles className="w-8 h-8 text-indigo-300" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-slate-50 mb-3 text-[22px]">
            AI Workspace Copilot
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 max-w-[600px] leading-relaxed text-[15px]">
            Ask anything about your people, jobs, time, or organization. AI-native workflows for HR, Talent, and Operations.
          </p>
        </div>
      </div>
    </div>
  );
}
