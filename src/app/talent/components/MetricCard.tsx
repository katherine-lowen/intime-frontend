"use client";

import Link from "next/link";
import * as React from "react";
import { cn } from "./ui/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string; // optional – makes metric clickable
};

export function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  href,
}: MetricCardProps) {
  const isClickable = !!href;

  const content = (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white p-4 text-sm shadow-sm transition",
        isClickable
          ? "border-slate-200 hover:shadow-md hover:border-slate-300 cursor-pointer"
          : "border-slate-200",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {Icon && (
          <span className="rounded-full bg-slate-50 p-1">
            <Icon className="h-4 w-4 text-slate-500" />
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-slate-900">
        {value}
      </div>
      {sublabel && (
        <p className="mt-1 text-[11px] text-slate-500">{sublabel}</p>
      )}
    </div>
  );

  return isClickable ? (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
      {content}
    </Link>
  ) : (
    content
  );
}
