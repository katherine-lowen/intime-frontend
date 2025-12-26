"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AiStudioShell({
  orgSlug,
  children,
}: {
  orgSlug: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const base = `/org/${orgSlug}/ai-studio`;

  const tabs = [
    { value: "actions", href: `${base}/actions`, label: "Actions" },
    { value: "activity", href: `${base}/activity`, label: "Activity" },
    { value: "settings", href: `${base}/settings`, label: "Settings" },
  ];

  const current =
    tabs.find((t) => pathname.startsWith(t.href))?.value ?? "actions";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">AI</p>
        <h1 className="text-2xl font-semibold text-slate-900">AI Studio</h1>
        <p className="text-sm text-slate-600">
          Control plane for AI across Intime.
        </p>
      </div>

      <Tabs value={current} className="w-full">
        <TabsList className="bg-slate-100">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} asChild>
              <Link href={tab.href}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div>{children}</div>
    </div>
  );
}
