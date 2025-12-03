import { ArrowRight } from "lucide-react";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary";
}

export function QuickAction({ title, description, icon, onClick, variant = "default" }: QuickActionProps) {
  const isPrimary = variant === "primary";
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all group ${
        isPrimary
          ? "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-sm"
          : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
      }`}
    >
      <div className={`mt-0.5 ${isPrimary ? "text-white" : "text-indigo-600"}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className={`text-sm mb-0.5 ${isPrimary ? "text-white" : "text-gray-900"}`}>
          {title}
        </div>
        <p className={`text-xs ${isPrimary ? "text-indigo-100" : "text-gray-500"}`}>
          {description}
        </p>
      </div>
      <ArrowRight className={`w-4 h-4 mt-1 transition-transform group-hover:translate-x-0.5 ${
        isPrimary ? "text-white/80" : "text-gray-400"
      }`} />
    </button>
  );
}