"use client";

import { useState } from "react";
import { Paperclip, Mic, Zap, ArrowUp } from "lucide-react";

interface PremiumInputProps {
  onSend: (message: string) => void;
}

export function PremiumInput({ onSend }: PremiumInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-slate-800/50 bg-gradient-to-t from-[#05050a] via-[#05050a]/95 to-transparent backdrop-blur-xl">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-5xl items-end gap-3 px-8 py-4"
      >
        {/* left icons */}
        <div className="flex flex-col gap-2 text-slate-500">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800/80"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800/80"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        {/* textarea */}
        <div className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2 shadow-[0_0_0_1px_rgba(15,23,42,0.7)]">
          <textarea
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI Workspace about roles, candidates, or hiring plans…"
            className="max-h-32 w-full resize-none bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <div className="inline-flex items-center gap-1">
              <Zap className="h-3 w-3 text-indigo-400" />
              <span>Cmd ⌘ + Enter to send</span>
            </div>
          </div>
        </div>

        {/* send button */}
        <button
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!message.trim()}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
