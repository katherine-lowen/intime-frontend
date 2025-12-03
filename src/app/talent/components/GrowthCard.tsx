"use client";

import Link from "next/link";
import * as React from "react";
import { cn } from "./ui/utils";

type GrowthCardProps = {
  title: string;
  description: string;
  status?: "coming-soon" | "active";
  href?: string; // future-proof
};

export function GrowthCard({
  title,
  description,
  status = "coming-soon",
  href,
}: GrowthCardProps) {
  const isActive = status === "active" && !!href;

  const content = (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white p-4 text-xs shadow-sm transition",
        isActive
          ? "border-slate-200 hover:shadow-md hover:border-slate-300 cursor-pointer"
          : "border-dashed border-slate-200 opacity-85",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {status === "coming-soon" && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Coming soon
          </span>
        )}
      </div>
      <p className="flex-1 leading-relaxed text-slate-600">{description}</p>
    </div>
  );

  return isActive ? (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
      {content}
    </Link>
  ) : (
    content
  );
}
