interface SuggestionChipsProps {
  onChipClick: (text: string) => void;
}

const suggestions = [
  { text: 'Summarize my workforce this quarter', icon: '✨' },
  { text: 'Draft a job description', icon: '📄' },
  { text: 'Compare candidates', icon: '🧑‍💼' },
  { text: 'Generate 30-60-90 plan', icon: '📊' },
  { text: 'Show PTO balances', icon: '🗓️' }
];

export function SuggestionChips({ onChipClick }: SuggestionChipsProps) {
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="flex flex-wrap gap-2.5 justify-center">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onChipClick(suggestion.text)}
            className="suggestion-chip px-[18px] py-2.5 rounded-full group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base group-hover:scale-110 transition-transform duration-200">
                {suggestion.icon}
              </span>
              <span className="text-slate-300 text-[14px] group-hover:text-slate-100 transition-colors">
                {suggestion.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
