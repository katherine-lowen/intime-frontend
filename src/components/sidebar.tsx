"use client";

import { useMemo, useState } from "react";
import { usePathname, useParams } from "next/navigation";
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
  ClipboardList,
} from "lucide-react";

import { NavSection } from "./NavSection";
import { NavItem } from "./navitem";
import { UserProfile } from "./UserProfile";
import { SearchBar } from "./SearchBar";
import { OrgSwitcher } from "./org-switcher";
import { cn } from "@/lib/utils";

type CurrentUser = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser?: CurrentUser | null;
}

const intelligenceLinks = [
  { label: "AI Studio Home", href: "/ai", icon: PanelsTopLeft },
  { label: "Workforce Pulse", href: "/ai/workforce", icon: Activity },
  { label: "Resume Match", href: "/ai#resume-match", icon: FileText },
  { label: "Candidate Summary", href: "/ai/summary", icon: ClipboardList },
  { label: "JD Generator", href: "/ai/jd", icon: Briefcase },
  { label: "Job Intake", href: "/ai/ai-job-intake", icon: ListChecks },
  { label: "Performance Review", href: "/ai/performance-review", icon: ClipboardList },
];

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  currentUser,
}: SidebarProps) {
  const pathname = usePathname() ?? "";
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params?.orgSlug as string | undefined;

  const withOrg = (path: string) => {
    if (!orgSlug) return path;
    if (path.startsWith("/employee")) return path;
    if (path.startsWith("/org/")) return path;
    return `/org/${orgSlug}${path}`;
  };

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  if (isAuthRoute) return null;

  const role = (currentUser?.role || "").toUpperCase();
  const isAdmin = role === "OWNER" || role === "ADMIN" || role === "MANAGER";
  const isEmployee = !isAdmin;

  const userName =
    currentUser?.name ||
    `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() ||
    undefined;

  return (
    <div
      className="relative flex h-full min-h-screen flex-col bg-gradient-to-b from-[#050815] via-[#070B16] to-[#0C101C] border-r border-white/[0.06] shadow-2xl"
      style={{
        width: isCollapsed ? "72px" : "260px",
        transition: "width 300ms cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      <button
        onClick={onToggleCollapse}
        className="absolute right-3 top-7 w-8 h-8 bg-[#0C101C] border border-white/10 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827] hover:scale-110 transition-all duration-200 shadow-xl z-20"
        type="button"
      >
        {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
      </button>

      <div className="flex flex-col h-full p-4">
        {!isCollapsed && <OrgSwitcher />}

        <div className="flex-1 overflow-y-auto space-y-1">
          {isEmployee ? (
            <NavSection label="EMPLOYEE" isCollapsed={isCollapsed}>
              <NavItem icon={Home} label="Home" href="/employee" isCollapsed={isCollapsed} />
              <NavItem icon={Users} label="My profile" href="/employee/profile" isCollapsed={isCollapsed} />
              <NavItem icon={Calendar} label="My time off" href="/employee/timeoff" isCollapsed={isCollapsed} />
              <NavItem icon={UserPlus} label="My tasks / onboarding" href="/employee/tasks" isCollapsed={isCollapsed} />
              <NavItem icon={FileText} label="My reviews" href="/employee/reviews" isCollapsed={isCollapsed} />
              <NavItem icon={FolderOpen} label="My documents" href="/employee/documents" isCollapsed={isCollapsed} />
            </NavSection>
          ) : (
            <>
              <NavSection label="OVERVIEW" isCollapsed={isCollapsed}>
                <NavItem icon={Home} label="Home" href={withOrg("/dashboard")} isCollapsed={isCollapsed} />
              </NavSection>

              <NavSection label="PEOPLE" isCollapsed={isCollapsed}>
                <NavItem icon={Users} label="People hub" href={withOrg("/people")} isCollapsed={isCollapsed} />
                <NavItem icon={UserPlus} label="Onboarding" href={withOrg("/onboarding")} isCollapsed={isCollapsed} />
                <NavItem icon={Calendar} label="Time off / PTO" href={withOrg("/timeoff")} isCollapsed={isCollapsed} />
                <NavItem icon={Calendar} label="Policies" href={withOrg("/timeoff/policies")} isCollapsed={isCollapsed} />
                <NavItem icon={ClipboardList} label="Requests" href={withOrg("/timeoff/requests")} isCollapsed={isCollapsed} />
                <NavItem icon={Calendar} label="Calendar" href={withOrg("/timeoff/calendar")} isCollapsed={isCollapsed} />
              </NavSection>

              <NavSection label="TALENT" isCollapsed={isCollapsed}>
                <NavItem icon={Target} label="Talent hub" href={withOrg("/talent")} isCollapsed={isCollapsed} />
                <NavItem icon={Briefcase} label="Recruiting" href={withOrg("/hiring")} isCollapsed={isCollapsed} />
                <NavItem icon={FileText} label="Onboarding templates" href={withOrg("/onboarding/templates")} isCollapsed={isCollapsed} />
              </NavSection>

              <NavSection label="PLATFORM" isCollapsed={isCollapsed}>
                <NavItem icon={Cog} label="Operations" href={withOrg("/operations")} isCollapsed={isCollapsed} />
                <NavItem icon={DollarSign} label="Payroll" href={withOrg("/payroll")} isCollapsed={isCollapsed} />
                <NavItem icon={GraduationCap} label="Learning" href={withOrg("/learning")} isCollapsed={isCollapsed} />
                <NavItem icon={FolderOpen} label="Documents" href={withOrg("/employee-documents")} isCollapsed={isCollapsed} />
                <NavItem icon={Zap} label="Obsession" href={withOrg("/obsession")} isCollapsed={isCollapsed} />

                <a
                  href={withOrg("/ai/workspace")}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  {!isCollapsed && <span className="text-sm font-semibold">AI Workspace</span>}
                </a>

                <div className="mt-1 space-y-1">
                  {intelligenceLinks.map((item) => (
                    <a
                      key={item.href}
                      href={withOrg(item.href)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/70"
                    >
                      <item.icon className="h-4 w-4 text-violet-300" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </a>
                  ))}
                </div>

                <NavItem icon={Cog} label="Settings" href={withOrg("/settings")} isCollapsed={isCollapsed} />
                {(role === "OWNER" || role === "ADMIN") && (
                  <NavItem icon={Users} label="Members" href={withOrg("/settings/members")} isCollapsed={isCollapsed} />
                )}
              </NavSection>
            </>
          )}
        </div>

        <UserProfile
          isCollapsed={isCollapsed}
          name={userName}
          secondary={currentUser?.email ?? currentUser?.role}
        />
      </div>
    </div>
  );
}
