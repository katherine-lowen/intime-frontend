import { LucideIcon, Bell } from 'lucide-react';

interface ComingSoonCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export function ComingSoonCard({ icon: Icon, title, description, gradient }: ComingSoonCardProps) {
  return (
    <div className="group relative h-full">
      {/* Gradient accent line at top */}
      <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${gradient} opacity-30 rounded-full`} />
      
      {/* Main card - dark theme, slightly muted */}
      <div className="relative h-full rounded-2xl bg-gray-900/40 backdrop-blur-sm border border-gray-800/40 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:border-gray-700/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
        {/* Coming soon badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-2.5 py-1 rounded-full bg-gray-800/60 border border-gray-700/60 text-[10px] text-gray-500 uppercase tracking-wide">
            Coming Soon
          </span>
        </div>
        
        <div className="relative p-6 flex flex-col h-full opacity-60 group-hover:opacity-75 transition-opacity duration-300">
          {/* Icon in glass circle */}
          <div className="mb-5">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} bg-opacity-10 backdrop-blur-md border border-white/5 shadow-sm flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3 mb-5">
            <h3 className="text-gray-300 text-lg">
              {title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Notify button */}
          <button className="group/btn w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700/60 text-gray-400 text-sm hover:bg-gray-700/60 hover:border-gray-600/60 hover:text-gray-300 transition-all duration-200">
            <Bell className="w-3.5 h-3.5" />
            <span>Notify me</span>
          </button>
        </div>
      </div>
    </div>
  );
}