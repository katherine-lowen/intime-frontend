import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onChooseJob: () => void;
}

export function Hero({ onChooseJob }: HeroProps) {
  return (
    <div className="flex items-start justify-between gap-8">
      {/* Left Side */}
      <div className="flex-1">
        {/* Pill tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full mb-6">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
          <span className="text-slate-600">Intime AI Studio</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Resume Match</span>
        </div>

        {/* Title */}
        <h1 className="text-slate-900 mb-3 tracking-tight">
          AI Resume Match
        </h1>

        {/* Description */}
        <p className="text-slate-600 max-w-[600px]">
          Score candidate fit using resume text, notes, and your active job descriptions.
        </p>
      </div>

      {/* Right Side - Choose Current Job Button */}
      <div className="flex-shrink-0 pt-8">
        <button
          onClick={onChooseJob}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-700"
        >
          <span>Choose Current Job</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
