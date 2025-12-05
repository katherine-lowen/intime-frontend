import { Sparkles } from 'lucide-react';

interface WorkspaceHeaderProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  'Summarize my workforce this quarter',
  'Draft a job description',
  'Compare candidates',
  'Generate 30-60-90 plan',
  'Show PTO balances'
];

export function WorkspaceHeader({ onSuggestionClick }: WorkspaceHeaderProps) {
  return (
    <div className="border-b border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-transparent backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-slate-50 mb-1">AI Workspace </h1>
            <p className="text-slate-400">
              Ask anything about your people, jobs, time, or organization.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-800/60 hover:border-indigo-500/30 hover:text-slate-100 transition-all duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
