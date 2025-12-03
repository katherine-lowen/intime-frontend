import { cn } from "@/lib/utils";

interface UserProfileProps {
  isCollapsed: boolean;
  name?: string | null;
  secondary?: string | null; // role or email
}

export function UserProfile({
  isCollapsed,
  name = "Guest",
  secondary = "Member",
}: UserProfileProps) {
  const initials = (name || "KS")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isCollapsed) {
    return (
      <div className="mt-4 flex items-center justify-center">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-[11px] font-semibold text-white">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 bg-white/2 hover:bg-white/4 transition-colors">
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-[11px] font-semibold text-white">
        {initials}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-[#F9FAFB] truncate">
          {name}
        </span>
        <span className="text-xs text-[#9CA3AF] truncate">{secondary}</span>
      </div>
    </div>
  );
}
