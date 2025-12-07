import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[#111827] flex items-center gap-3">
          AI Workforce Pulse
        </h1>
        <p className="text-[#6B7280] mt-2">
          Real-time workforce intelligence powered by Intime AI.
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
          <Sparkles className="w-4 h-4" />
          Generate Full AI Summary
        </button>
        <span className="text-[#9CA3AF]">
          Last updated 3 minutes ago
        </span>
      </div>
    </div>
  );
}
