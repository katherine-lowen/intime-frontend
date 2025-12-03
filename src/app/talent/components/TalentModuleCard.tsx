"use client";

import Link from "next/link";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";

type TalentModuleStatus = "active" | "coming-soon";

export type TalentModuleCardProps = {
  title: string;
  description: string;
  status: TalentModuleStatus;
  accentColor?: string;
  href?: string; // ✅ now allowed
};

export function TalentModuleCard({
  title,
  description,
  status,
  accentColor = "#2C6DF9",
  href,
}: TalentModuleCardProps) {
  const isActive = status === "active" && !!href;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white p-4 text-sm shadow-sm transition",
        isActive
          ? "border-slate-200 hover:shadow-md hover:border-slate-300"
          : "border-dashed border-slate-200 opacity-80",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        {status === "coming-soon" && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Coming soon
          </span>
        )}
      </div>

      <p className="flex-1 text-xs leading-relaxed text-slate-600">
        {description}
      </p>

      <div className="mt-4">
        {isActive ? (
          <Button size="sm" className="h-7 px-3 text-xs" asChild>
            <Link href={href}>Open workspace</Link>
          </Button>
        ) : (
          <button
            className="h-7 cursor-not-allowed rounded-md bg-slate-100 px-3 text-[11px] font-medium text-slate-500"
            disabled
            type="button"
          >
            In roadmap
          </button>
        )}
      </div>
    </div>
  );
}
