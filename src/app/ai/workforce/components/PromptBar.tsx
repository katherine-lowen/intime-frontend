// src/app/ai/workforce/components/PromptBar.tsx
"use client";

import { Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";

type PromptBarProps = {
  context: {
    headcount: number;
    openRoles: number;
    activeCandidates: number;
    timeOffToday: number;
    termsLast90d: number;
  };
};

export function PromptBar({ context }: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generate dynamic suggested prompts based on real org data.
   */
  const suggestedPrompts = useMemo(() => {
    const items: string[] = [];

    if (context.termsLast90d > 0) {
      items.push("What is driving recent turnover?");
      items.push("Which teams show rising attrition risk?");
    } else {
      items.push("How is retention trending this quarter?");
    }

    if (context.openRoles > 0) {
      items.push(`Analyze hiring bottlenecks for ${context.openRoles} open roles`);
    }

    if (context.activeCandidates > 15) {
      items.push("Predict conversion across the candidate pipeline");
    }

    if (context.timeOffToday > 0) {
      items.push("How is PTO impacting team capacity today?");
    }

    // Always include a couple universal prompts
    items.push("Give me a workforce health summary");
    items.push("Predict payroll variance next month");

    return items.slice(0, 4);
  }, [context]);

  /**
   * Submit handler — currently simulates AI output
   * (full backend endpoint can be added when you're ready)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setAiResponse(null);

    // Simulated 900ms AI response delay
    await new Promise((r) => setTimeout(r, 900));

    setAiResponse(
      `Here's what I'm seeing: Based on current headcount (${context.headcount}), open roles (${context.openRoles}), and PTO impact (${context.timeOffToday}), Intime AI would analyze "${prompt}" by pulling hiring data, retention signals, and team load patterns to generate an actionable summary.`
    );

    setIsLoading(false);
    setPrompt("");
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
      {/* Prompt Input */}
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
            disabled={isLoading}
            className="flex-shrink-0 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white p-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Suggested Prompts */}
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedPrompts.map((suggested) => (
          <button
            key={suggested}
            onClick={() => setPrompt(suggested)}
            className="px-3 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-colors text-sm"
          >
            {suggested}
          </button>
        ))}
      </div>

      {/* AI Response */}
      {isLoading && (
        <div className="mt-6 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] text-sm animate-pulse">
          Intime AI is analyzing your request…
        </div>
      )}

      {aiResponse && !isLoading && (
        <div className="mt-6 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] text-sm">
          <span className="text-[#111827] font-medium block mb-1">
            AI Response:
          </span>
          {aiResponse}
        </div>
      )}
    </div>
  );
}
