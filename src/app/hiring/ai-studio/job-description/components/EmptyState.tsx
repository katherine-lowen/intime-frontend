import { Sparkles } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="bg-gradient-to-br from-slate-50/50 to-indigo-50/30 rounded-[20px] border-2 border-dashed border-slate-200 p-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse" />
          
          {/* Icon container */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Sparkles className="w-10 h-10 text-white" />
            
            {/* Decorative sparkles */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-75" />
          </div>
        </div>
        
        <h3 className="text-slate-900 mb-3">Your AI-Generated Job Description</h3>
        <p className="text-slate-600 leading-relaxed">
          Ready when you are — just describe the role and I'll write a world-class job description tailored to your needs.
        </p>
      </div>
    </div>
  );
}
