import { ReactNode } from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  caption?: string;
  variant?: 'primary' | 'subtle';
  children: ReactNode;
}

export function Card({ title, subtitle, icon, caption, variant = 'primary', children }: CardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all ${
        variant === 'subtle'
          ? 'bg-[#F9FAFB]/50 border-gray-200/60 shadow-sm'
          : 'bg-white border-[#E7E9EC] shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_32px_rgba(15,23,42,0.08)]'
      }`}
    >
      <div className="px-10 py-7 border-b border-gray-100/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-600">
                {icon}
              </div>
            )}
            <div className="flex items-baseline gap-3">
              <h2 className="text-[16px] text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          {caption && (
            <span className="text-[13px] text-gray-500">{caption}</span>
          )}
        </div>
      </div>
      <div className="px-10 py-8">{children}</div>
    </div>
  );
}
