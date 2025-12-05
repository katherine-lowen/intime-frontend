import { Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

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
      <div className="flex-1 max-w-3xl">
        {/* Text content */}
        {content && (
          <div className="text-slate-200 text-[15px] leading-relaxed mb-4">
            {content}
          </div>
        )}

        {/* Child components (cards, tables, etc) */}
        {children}
      </div>
    </div>
  );
}
