"use client";

import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const Legacy = dynamic(() => import("@/app/performance/reviews/page"), {
  ssr: false,
});

export default function OrgPerformanceReviewsPage() {
  const params = useParams() as { orgSlug?: string } | null;
  const orgSlug = params?.orgSlug ?? "demo-org";

  const sp = useSearchParams();
  const employeeId = sp?.get("employeeId") ?? undefined;

  // Provide orgSlug to the legacy server component in a way that doesn't require prop typing
  useEffect(() => {
    (globalThis as any).__INTIME_ORG_SLUG__ = orgSlug;
    return () => {
      // optional cleanup
      try {
        delete (globalThis as any).__INTIME_ORG_SLUG__;
      } catch {}
    };
  }, [orgSlug]);

  return <Legacy searchParams={employeeId ? { employeeId } : {}} />;
}
