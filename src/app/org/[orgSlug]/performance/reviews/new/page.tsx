"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const Legacy = dynamic(() => import("@/app/performance/reviews/new/page"), {
  ssr: false,
});

export default function OrgPerformanceReviewsNewPage() {
  const params = useParams() as { orgSlug?: string } | null;
  const orgSlug = params?.orgSlug ?? "demo-org";

  useEffect(() => {
    (globalThis as any).__INTIME_ORG_SLUG__ = orgSlug;
    return () => {
      try {
        delete (globalThis as any).__INTIME_ORG_SLUG__;
      } catch {}
    };
  }, [orgSlug]);

  return <Legacy />;
}
