"use client";

import { useState } from "react";
import { HeroHeader } from "./components/HeroHeader";
import { SuggestionChips } from "./components/SuggestionChips";
import { AIMessageCard } from "./components/AIMessageCard";
import { UserMessageBubble } from "./components/UserMessageBubble";
import { PremiumInput } from "./components/PremiumInput";
import { WorkforceSummaryCard } from "./components/cards/WorkforceSummaryCard";
import { PTOInsightsCard } from "./components/cards/PTOInsightsCard";
import { CandidateComparisonCard } from "./components/cards/CandidateComparisonCard";

type CopilotComponent = "workforce" | "pto" | "candidate" | "job" | "plan";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  component?: CopilotComponent;
}

// 🔧 company / org context – update these to pull from your real data later
const ORG_CONTEXT = {
  orgId: process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org",
  orgName: "Intime demo workspace",
  headcount: 48,
  locations: ["Remote", "New York"],
  primaryDepartments: ["Engineering", "Sales", "Customer Success"],
  industry: "B2B SaaS",
};

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI Workspace Copilot. I can help you analyze your workforce, evaluate candidates, draft job descriptions, track PTO, and generate strategic plans. What would you like to explore today?",
    },
  ]);

  const [showChips, setShowChips] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const renderMessageComponent = (component?: CopilotComponent) => {
    switch (component) {
      case "workforce":
        return <WorkforceSummaryCard />;
      case "pto":
        return <PTOInsightsCard />;
      case "candidate":
        return <CandidateComparisonCard />;
      default:
        return null;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const id = Date.now().toString();

    const userMessage: Message = {
      id,
      type: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowChips(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          orgContext: ORG_CONTEXT,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to call AI copilot API");
      }

      const data: {
        reply: string;
        component?: CopilotComponent;
      } = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.reply,
        component: data.component,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("[Copilot] error", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content:
            "I'm having trouble reaching the AI service right now. Please check your API key or try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Hero Header */}
      <HeroHeader />

      {/* Suggestion Chips */}
      {showChips && <SuggestionChips onChipClick={handleSendMessage} />}

      {/* Chat Canvas */}
      <div className="flex-1 vignette noise overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12 space-y-4">
          {messages.map((message) =>
            message.type === "user" ? (
              <UserMessageBubble key={message.id} content={message.content} />
            ) : (
              <AIMessageCard key={message.id} content={message.content}>
                {renderMessageComponent(message.component)}
              </AIMessageCard>
            ),
          )}

          {isLoading && (
            <AIMessageCard content="Thinking about your workspace…">
              {/* You can add a skeleton / loader shimmer here */}
            </AIMessageCard>
          )}
        </div>
      </div>

      {/* Premium Input */}
      <PremiumInput onSend={handleSendMessage} />
    </div>
  );
}
