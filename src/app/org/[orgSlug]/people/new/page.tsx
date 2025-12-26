"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markCompleted } from "@/lib/activation";

const Legacy = dynamic(() => import("@/app/people/new/page"), { ssr: false });

export default function PeopleNewPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug ?? "demo-org";

  return (
    <div className="space-y-4">
      <Legacy />
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span>Mark this step as done (dev helper)</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => markCompleted(orgSlug, "add_employee")}
          >
            Mark complete
          </Button>
        </div>
      </div>
    </div>
  );
}
