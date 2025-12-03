import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavSectionProps {
  label: string;
  isCollapsed: boolean;
  children: ReactNode;
}

export function NavSection({ label, isCollapsed, children }: NavSectionProps) {
  return (
    <div className="mt-4">
      {!isCollapsed && (
        <div className="px-3 mb-2 text-[11px] font-medium tracking-[0.16em] text-[#6B7280] uppercase">
          {label}
        </div>
      )}
      <div
        className={cn(
          "space-y-1",
          isCollapsed && "flex flex-col items-center gap-1"
        )}
      >
        {children}
      </div>
    </div>
  );
}
