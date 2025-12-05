import { Paperclip, Mic, Zap, ArrowUp } from 'lucide-react';
import { useState } from 'react';

interface PremiumInputProps {
  onSend: (message: string) => void;
}

export function PremiumInput({ onSend }: PremiumInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-slate-800/50 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="premium-input rounded-full flex items-center gap-3 px-6 py-3.5">
            {/* Attachment buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 transition-all duration-200"
                title="Attach file"
              >
                <Paperclip className="w-4.5 h-4.5" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 transition-all duration-200"
                title="Voice input"
              >
                <Mic className="w-4.5 h-4.5" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 transition-all duration-200"
                title="AI rewrite"
              >
                <Zap className="w-4.5 h-4.5" strokeWidth={2} />
              </button>
            </div>

            {/* Input field */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your workforce…"
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-[15px]"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!message.trim()}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/30"
            >
              <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Keyboard shortcut hint */}
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-400 text-[11px] min-w-[18px] text-center">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-400 text-[11px] min-w-[18px] text-center">
              ⏎
            </kbd>
            <span className="text-slate-500 text-[12px]">to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
