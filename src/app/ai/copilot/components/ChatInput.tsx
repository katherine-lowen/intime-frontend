import { Mic, Paperclip, Zap, Send } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
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
    <div className="border-t border-slate-800/50 bg-gradient-to-t from-slate-900/80 to-transparent backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="glass-input rounded-2xl flex items-center gap-3 px-4 py-3 transition-all">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your workforce…"
              className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-colors"
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-colors"
                title="AI rewrite"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!message.trim()}
                className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
        
        <div className="flex justify-center mt-3">
          <div className="px-3 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 text-slate-400 flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-700/50 border border-slate-600 text-xs">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-700/50 border border-slate-600 text-xs">⏎</kbd>
            <span className="text-xs">to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
