import { Bot, User } from 'lucide-react';
import { ReactNode } from 'react';

interface ChatMessageProps {
  type: 'user' | 'ai';
  content?: string;
  children?: ReactNode;
}

export function ChatMessage({ type, content, children }: ChatMessageProps) {
  if (type === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="px-4 py-3 rounded-2xl bg-indigo-500 text-white">
            {content}
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-600">
            <User className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-start gap-3 max-w-3xl w-full">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 space-y-3">
          {content && (
            <div className="text-slate-200">
              {content}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
