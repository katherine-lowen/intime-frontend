"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  isCollapsed: boolean;
  badge?: string;
};

export function NavItem({
  icon: Icon,
  label,
  href,
  isCollapsed,
  badge,
}: NavItemProps) {
  const pathname = usePathname() ?? "";
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  if (isCollapsed) {
    return (
      <Link
        href={href}
        className={cn(
          "group relative flex items-center justify-center rounded-lg h-10 w-10",
          "text-[#D1D5DB] hover:text-white",
          "hover:bg-white/5 transition-all duration-200"
        )}
        title={label}
      >
        <Icon className="h-4 w-4" strokeWidth={1.6} />
        {badge && (
          <span className="absolute -top-1 -right-1 min-w-[16px] px-1 rounded-full bg-[#3B82F6] text-[10px] leading-[14px] font-medium text-white text-center">
            {badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center rounded-lg px-3 py-2 h-10 text-sm font-medium transition-all duration-200",
        "text-[#D1D5DB] hover:text-white",
        isActive
          ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-md"
          : "hover:bg-white/5"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-[#60A5FA]" />
      )}

      <Icon
        className={cn(
          "mr-3 h-4 w-4 flex-shrink-0",
          isActive ? "text-white" : "text-[#9CA3AF] group-hover:text-white"
        )}
        strokeWidth={1.6}
      />

      <span className="truncate">{label}</span>

      {badge && (
        <span
          className={cn(
            "ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] leading-[14px] font-medium",
            isActive
              ? "bg-white/20 text-white"
              : "bg-white/8 text-[#E5E7EB] group-hover:bg-white/12"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
