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
  Activity,
  PanelsTopLeft,
  ListChecks,
  ClipboardList
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

// ⭐ Intelligence Suite links
const intelligenceLinks = [
  { label: "AI Studio Home", href: "/ai", icon: PanelsTopLeft },
  { label: "Workforce Pulse", href: "/ai/workforce", icon: Activity },
  { label: "Resume Match", href: "/ai#resume-match", icon: FileText },
  { label: "Candidate Summary", href: "/ai/summary", icon: ClipboardList },
  { label: "JD Generator", href: "/ai/jd", icon: Briefcase },
  { label: "Job Intake", href: "/ai/ai-job-intake", icon: ListChecks },
  { label: "Performance Review", href: "/ai/performance-review", icon: ClipboardList }
];

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  currentUser
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
        transition: "width 300ms cubic-bezier(0.25, 0.1, 0.25, 1)"
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
        {/* Logo */}
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

        {/* Search + Notifications */}
        <div
          className={`mb-6 ${
            isCollapsed
              ? "flex flex-col items-center gap-3"
              : "flex items-center gap-2"
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

        {/* MAIN NAV */}
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          {/* Overview */}
          <NavSection label="OVERVIEW" isCollapsed={isCollapsed}>
            <NavItem icon={Home} label="Home" href="/dashboard" isCollapsed={isCollapsed} />
          </NavSection>

          {/* People */}
          <NavSection label="PEOPLE" isCollapsed={isCollapsed}>
            <NavItem icon={Users} label="People hub" href="/people" isCollapsed={isCollapsed} />
            <NavItem icon={UserPlus} label="Onboarding" href="/onboarding" isCollapsed={isCollapsed} />
            <NavItem icon={Calendar} label="Time off / PTO" href="/timeoff" isCollapsed={isCollapsed} />
          </NavSection>

          {/* Talent */}
          <NavSection label="TALENT" isCollapsed={isCollapsed}>
            <NavItem icon={Target} label="Talent hub" href="/talent" isCollapsed={isCollapsed} />
            <NavItem icon={Briefcase} label="Recruiting" href="/hiring" isCollapsed={isCollapsed} />
            <NavItem icon={FileText} label="Onboarding templates" href="/onboarding/templates" isCollapsed={isCollapsed} />
          </NavSection>

          {/* Platform & Intelligence Suite */}
          <NavSection label="PLATFORM" isCollapsed={isCollapsed}>
            <NavItem icon={Cog} label="Operations" href="/operations" isCollapsed={isCollapsed} />
            <NavItem icon={DollarSign} label="Payroll" href="/payroll" isCollapsed={isCollapsed} />
            <NavItem icon={GraduationCap} label="Learning" href="/learning" isCollapsed={isCollapsed} />
            <NavItem icon={FolderOpen} label="Documents" href="/employee-documents" isCollapsed={isCollapsed} />
            <NavItem icon={Zap} label="Obsession" href="/obsession" isCollapsed={isCollapsed} />

            {/* ⭐ AI WORKSPACE (unchanged) */}
            <a
              href="/ai/workspace"
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 group transition-all duration-300",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-all duration-500",
                  "bg-gradient-to-br from-[#4F46E5]/40 via-[#7C3AED]/40 to-[#EC4899]/40"
                )}
              />
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
                  AI Workspace
                </span>
              )}
            </a>

            {/* ⭐ NEW INTELLIGENCE SUITE FLYOUT */}
            <div className="relative group mt-1">
              {/* Parent row routes to /ai */}
              <a
                href="/ai"
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                  "hover:bg-white/5",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-600/70">
                  <Activity className="h-4 w-4 text-violet-300" />
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Intelligence Suite
                    </span>
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                      AI
                    </span>
                  </div>
                )}
              </a>

              {/* Flyout */}
              <div className="pointer-events-none absolute left-full top-0 z-50 ml-2 w-72 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Intelligence Suite
                  </p>

                  <div className="space-y-1">
                    {intelligenceLinks.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 text-xs text-slate-200 hover:bg-slate-800/70 transition-all"
                      >
                        <item.icon className="h-4 w-4 text-violet-300" />
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <NavItem icon={Cog} label="Settings" href="/settings" isCollapsed={isCollapsed} />
          </NavSection>
        </div>

        {/* Footer User */}
        <UserProfile
          isCollapsed={isCollapsed}
          name={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined}
          secondary={currentUser?.email ?? currentUser?.role}
        />
      </div>
    </div>
  );
}
