"use client";

import {
  Home,
  Users,
  UserPlus,
  Calendar,
  Target,
  Briefcase,
  FileText,
  Cog,
  DollarSign,
  GraduationCap,
  FolderOpen,
  Zap,
  PanelLeftClose,
  PanelLeft,
  Bell,
  Sparkles,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { NavSection } from "./NavSection";
import { NavItem } from "./navitem";
import { UserProfile } from "./UserProfile";
import { SearchBar } from "./SearchBar";
import { OrgSwitcher } from "./OrgSwitcher";
import { cn } from "@/lib/utils";

type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser?: CurrentUser | null;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  currentUser,
}: SidebarProps) {
  const pathname = usePathname() ?? "";

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthRoute) return null;

  return (
    <div
      className="relative flex flex-col bg-gradient-to-b from-[#050815] via-[#070B16] to-[#0C101C] border-r border-white/[0.06] shadow-2xl"
      style={{
        width: isCollapsed ? "72px" : "260px",
        transition: "width 300ms cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      {/* Vignettes */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute right-3 top-7 w-8 h-8 bg-[#0C101C] border border-white/10 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827] hover:scale-110 transition-all duration-200 shadow-xl z-20"
        type="button"
      >
        {isCollapsed ? (
          <PanelLeft size={16} strokeWidth={2} />
        ) : (
          <PanelLeftClose size={16} strokeWidth={2} />
        )}
      </button>

      <div className="flex flex-col h-full p-4 relative z-10">
        {/* Logo / brand */}
        <div className={`mb-4 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          <div
            className={`flex items-center gap-3 mb-3 ${
              isCollapsed ? "flex-col gap-2" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center relative">
              <span className="text-white text-[20px] font-extrabold leading-none">
                !
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] blur-md opacity-40" />
            </div>

            {!isCollapsed && (
              <div>
                <div className="text-[18px] font-semibold text-[#F9FAFB] leading-tight">
                  Intime
                </div>
                <div className="text-[12px] font-medium text-[#9CA3AF] tracking-wide">
                  HR Platform
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <p className="text-[11px] text-[#6B7280] tracking-wide leading-relaxed mb-4">
              People, hiring, and time-aware insights.
            </p>
          )}
        </div>

        {!isCollapsed && <OrgSwitcher />}

        {/* Search + bell */}
        <div
          className={`mb-6 ${
            isCollapsed ? "flex flex-col items-center gap-3" : "flex items-center gap-2"
          }`}
        >
          {!isCollapsed && <SearchBar />}

          <button
            className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
            type="button"
          >
            <Bell
              size={16}
              className="text-[#9CA3AF] group-hover:text-[#F9FAFB]"
              strokeWidth={1.5}
            />
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#3B82F6] rounded-full border border-[#050815]" />
          </button>
        </div>

        {/* Main Nav Sections */}
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          <NavSection label="OVERVIEW" isCollapsed={isCollapsed}>
            <NavItem
              icon={Home}
              label="Home"
              href="/dashboard"
              isCollapsed={isCollapsed}
            />
          </NavSection>

          <NavSection label="PEOPLE" isCollapsed={isCollapsed}>
            <NavItem icon={Users} label="People hub" href="/people" isCollapsed={isCollapsed} />
            <NavItem icon={UserPlus} label="Onboarding" href="/onboarding" isCollapsed={isCollapsed} />
            <NavItem icon={Calendar} label="Time off / PTO" href="/timeoff" isCollapsed={isCollapsed} />
          </NavSection>

          <NavSection label="TALENT" isCollapsed={isCollapsed}>
            <NavItem icon={Target} label="Talent hub" href="/talent" isCollapsed={isCollapsed} />
            <NavItem icon={Briefcase} label="Recruiting" href="/hiring" isCollapsed={isCollapsed} />
            <NavItem icon={FileText} label="Onboarding templates" href="/onboarding/templates" isCollapsed={isCollapsed} />
          </NavSection>

          <NavSection label="PLATFORM" isCollapsed={isCollapsed}>
            <NavItem icon={Cog} label="Operations" href="/operations" isCollapsed={isCollapsed} />
            <NavItem icon={DollarSign} label="Payroll" href="/payroll" isCollapsed={isCollapsed} />
            <NavItem icon={GraduationCap} label="Learning" href="/learning" isCollapsed={isCollapsed} />
            <NavItem icon={FolderOpen} label="Documents" href="/employee-documents" isCollapsed={isCollapsed} />
            <NavItem icon={Zap} label="Obsession" href="/obsession" isCollapsed={isCollapsed} />

            {/* ⭐ SPECIAL AI COPILOT ITEM */}
            <a
              href="/ai/copilot"
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 group transition-all duration-300",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              {/* glowing gradient pane */}
              <div
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-all duration-500",
                  "bg-gradient-to-br from-[#4F46E5]/40 via-[#7C3AED]/40 to-[#EC4899]/40"
                )}
              />

              {/* Icon capsule */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center h-8 w-8 rounded-lg",
                  "bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#EC4899]",
                  "shadow-lg shadow-indigo-600/30 group-hover:shadow-pink-500/40",
                  "transition-all duration-300 group-hover:scale-110"
                )}
              >
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
              </div>

              {!isCollapsed && (
                <span
                  className={cn(
                    "relative z-10 text-sm font-semibold bg-clip-text text-transparent",
                    "bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300",
                    "tracking-wide"
                  )}
                >
                  AI Copilot
                </span>
              )}
            </a>

            <NavItem icon={Cog} label="Settings" href="/settings" isCollapsed={isCollapsed} />
          </NavSection>
        </div>

        {/* Footer User */}
        <UserProfile
          isCollapsed={isCollapsed}
          name={
            currentUser
              ? `${currentUser.firstName} ${currentUser.lastName}`
              : undefined
          }
          secondary={currentUser?.email ?? currentUser?.role}
        />
      </div>
    </div>
  );
}
