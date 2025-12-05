"use client";

interface SuggestionChipsProps {
  onChipClick: (message: string) => void;
}

const SUGGESTIONS = [
  "Show me a summary of my workforce.",
  "Analyze PTO patterns this quarter.",
  "Compare my top candidates for the AE role.",
  "Help me draft a job description for a senior engineer.",
];

export function SuggestionChips({ onChipClick }: SuggestionChipsProps) {
  return (
    <div className="border-b border-slate-800/60 bg-[#05050a]/80">
      <div className="max-w-5xl mx-auto px-8 py-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onChipClick(text)}
            className="text-xs rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-slate-200 hover:border-slate-500 hover:bg-slate-800/80 transition-colors"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
