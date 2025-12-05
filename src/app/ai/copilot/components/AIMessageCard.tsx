"use client";

import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ReactNode } from "react";

interface AIMessageCardProps {
  content: string;
  children?: ReactNode;
}

export function AIMessageCard({ content, children }: AIMessageCardProps) {
  return (
    <div className="flex items-start gap-4 mb-8">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-400/30 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-indigo-300" strokeWidth={2} />
      </div>

      {/* Message Card */}
      <div className="flex-1 max-w-3xl space-y-4">
        {/* Markdown-rendered text content */}
        {content && (
          <div className="prose prose-invert max-w-none text-slate-200 text-[15px] leading-relaxed">
            <ReactMarkdown
              // cast to any to avoid react-markdown's strict typing drama
              components={
                {
                  p: (props: any) => (
                    <p
                      className="mb-3 text-[15px] leading-relaxed"
                      {...props}
                    />
                  ),
                  strong: (props: any) => (
                    <strong
                      className="font-semibold text-white"
                      {...props}
                    />
                  ),
                  ul: (props: any) => (
                    <ul
                      className="mb-3 ml-5 list-disc space-y-1 text-[15px]"
                      {...props}
                    />
                  ),
                  ol: (props: any) => (
                    <ol
                      className="mb-3 ml-5 list-decimal space-y-1 text-[15px]"
                      {...props}
                    />
                  ),
                  li: (props: any) => (
                    <li className="leading-snug" {...props} />
                  ),
                  h1: (props: any) => (
                    <h1
                      className="text-lg font-semibold mb-2 text-white"
                      {...props}
                    />
                  ),
                  h2: (props: any) => (
                    <h2
                      className="text-base font-semibold mb-2 text-white"
                      {...props}
                    />
                  ),
                  h3: (props: any) => (
                    <h3
                      className="text-[15px] font-semibold mb-1 text-white"
                      {...props}
                    />
                  ),
                } as any
              }
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Child components (cards, tables, etc) */}
        {children}
      </div>
    </div>
  );
}
