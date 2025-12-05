import { Plus, Copy, Download, RotateCcw, Check } from 'lucide-react';
import { useState } from 'react';

interface ActionBarProps {
  onCreateJob: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onStartOver: () => void;
}

export function ActionBar({ onCreateJob, onCopy, onDownload, onStartOver }: ActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-t border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-indigo-50/30 px-10 py-6">
      <div className="flex items-center justify-between">
        {/* Primary Action */}
        <button
          onClick={onCreateJob}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
          </div>
          
          <Plus className="w-5 h-5 relative" />
          <span className="relative">Create Job from This JD</span>
        </button>

        {/* Secondary Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-xl hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all shadow-sm hover:shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy JD</span>
              </>
            )}
          </button>

          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-xl hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={onStartOver}
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-xl hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all shadow-sm hover:shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Over</span>
          </button>
        </div>
      </div>
    </div>
  );
}