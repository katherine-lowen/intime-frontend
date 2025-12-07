import { Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

const suggestedPrompts = [
  'Why is turnover rising?',
  'Predict payroll variance next month',
  'Which teams are overloaded?',
  'Show me hiring bottlenecks'
];

export function PromptBar() {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle prompt submission
    console.log('Prompt submitted:', prompt);
    setPrompt('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] focus-within:border-[#6366F1] focus-within:ring-2 focus-within:ring-[#6366F1]/10 transition-all">
          <Sparkles className="w-5 h-5 text-[#8B5CF6] flex-shrink-0" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Intime AI anything about your workforce…"
            className="flex-1 bg-transparent border-none outline-none text-[#111827] placeholder:text-[#9CA3AF]"
          />
          <button
            type="submit"
            className="flex-shrink-0 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedPrompts.map((suggested) => (
          <button
            key={suggested}
            onClick={() => setPrompt(suggested)}
            className="px-3 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-colors"
          >
            {suggested}
          </button>
        ))}
      </div>
    </div>
  );
}
