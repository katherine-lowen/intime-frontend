import { ReactNode } from "react";
import { Lock } from "lucide-react";

interface ComingSoonCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

export function ComingSoonCard({ icon, title, description, gradientFrom, gradientTo }: ComingSoonCardProps) {
  return (
    <div className="relative bg-white/40 backdrop-blur-lg rounded-[20px] border border-slate-200/60 p-6 hover:bg-white/60 hover:border-slate-300/60 transition-all duration-300 group cursor-not-allowed overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Lock badge */}
      <div className="absolute top-4 right-4 bg-slate-100/80 rounded-lg p-1.5">
        <Lock className="w-3 h-3 text-slate-400" />
      </div>
      
      <div className="relative space-y-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-20 flex items-center justify-center text-white transition-opacity duration-300 group-hover:opacity-30`}>
          {icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-slate-800">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>
        
        <div className="pt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 text-slate-600 rounded-lg text-xs">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
