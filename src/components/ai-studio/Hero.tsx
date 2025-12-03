import { PreviewWidget } from './PreviewWidget';
import { Sparkles, Zap } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative mb-32">
      {/* Dark glass frosted hero card */}
      <div className="relative rounded-[40px] bg-gray-900/60 backdrop-blur-2xl border border-gray-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
        {/* Inner gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-blue-900/10 to-transparent pointer-events-none" />
        
        {/* Subtle top edge glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
        
        {/* Content wrapper with padding */}
        <div className="relative px-12 md:px-16 pt-20 md:pt-24 pb-16 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10 max-w-[740px]">
              {/* Pill badges with AI signals */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 text-sm text-indigo-300 shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Intime AI Studio
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 backdrop-blur-sm border border-violet-400/20 text-sm text-violet-300">
                  <Zap className="w-3.5 h-3.5" />
                  Early access
                </span>
              </div>

              {/* Headline with gradient on key phrase */}
              <div className="space-y-6">
                <h1 className="text-[56px] md:text-[64px] leading-[1.1] tracking-[-0.02em] text-white">
                  Orchestrate hiring with{' '}
                  <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    AI-native workflows.
                  </span>
                </h1>
                <p className="text-lg text-gray-400 leading-[1.7] max-w-[680px]">
                  Centralize Intime's AI tools for hiring—job intake, job descriptions, candidate summaries, 
                  performance reviews, and onboarding plans. Powered by live HRIS events and people data.
                </p>
              </div>

              {/* Feature badges with icons and glass styling */}
              <div className="relative">
                {/* Gradient panel behind badges */}
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-900/20 via-blue-900/20 to-transparent rounded-2xl blur-xl" />
                
                <div className="relative flex flex-wrap gap-3">
                  <div className="group px-5 py-3 rounded-full bg-gray-800/60 backdrop-blur-md border border-gray-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)] hover:border-gray-600/60 transition-all duration-300">
                    <span className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-base">👥</span>
                      Built for talent & HR teams
                    </span>
                  </div>
                  <div className="group px-5 py-3 rounded-full bg-gray-800/60 backdrop-blur-md border border-gray-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)] hover:border-gray-600/60 transition-all duration-300">
                    <span className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-base">⏱️</span>
                      Time-aware insights
                    </span>
                  </div>
                  <div className="group px-5 py-3 rounded-full bg-gray-800/60 backdrop-blur-md border border-gray-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)] hover:border-gray-600/60 transition-all duration-300">
                    <span className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-base">🧠</span>
                      Works on Intime HRIS data
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics strip */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 backdrop-blur-sm shadow-lg shadow-indigo-500/10">
                  <span className="text-sm text-indigo-300">6 AI tools</span>
                </div>
                <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 backdrop-blur-sm shadow-lg shadow-indigo-500/10">
                  <span className="text-sm text-indigo-300">0 copy-paste</span>
                </div>
              </div>
            </div>

            {/* Right Preview Widget */}
            <div className="hidden lg:block">
              <PreviewWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}