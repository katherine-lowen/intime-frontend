import { Paperclip, Mic, Zap, ArrowUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface PremiumInputProps {
  onSend: (message: string) => void;
  preset?: string;
}

export function PremiumInput({ onSend, preset }: PremiumInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (preset !== undefined) {
      setMessage(preset);
      inputRef.current?.focus();
    }
  }, [preset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed) {
      onSend(trimmed);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ⌘+Enter or Ctrl+Enter to send (same as before)
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    // For now, just log the files; later you can upload + send to AI
    console.log("[Workspace] Selected files:", Array.from(files));

    // Reset so selecting the same file again still fires change
    e.target.value = "";
  };

  const handleMicClick = () => {
    // Visual-only toggle for now
    setIsRecording((prev) => !prev);
  };

  const handleZapClick = () => {
    // If empty, drop in a smart default prompt
    if (!message.trim()) {
      setMessage("Summarize my workforce this quarter.");
      return;
    }

    // If there's already text, turn it into a rewrite instruction
    setMessage(
      `Rewrite this more clearly and concisely for an HR leader:\n\n${message}`,
    );
  };

  const isSendDisabled = !message.trim();

  return (
    <div className="sticky bottom-0 border-t border-slate-800/50 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="premium-input rounded-full flex items-center gap-3 px-6 py-3.5">
            {/* Attachment buttons */}
            <div className="flex items-center gap-1">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={handleAttachClick}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 transition-all duration-200"
                title="Attach file"
              >
                <Paperclip className="w-4.5 h-4.5" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={handleMicClick}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isRecording
                    ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                    : "hover:bg-slate-700/50 text-slate-400 hover:text-slate-300"
                }`}
                title="Voice input"
              >
                <Mic className="w-4.5 h-4.5" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={handleZapClick}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-300 transition-all duration-200"
                title="AI assist"
              >
                <Zap className="w-4.5 h-4.5" strokeWidth={2} />
              </button>
            </div>

            {/* Input field */}
            <input
              type="text"
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your org… headcount, hiring, PTO, performance"
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-[15px]"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isSendDisabled}
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
