"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const Legacy = dynamic(
  () => import("@/app/performance/reviews/[id]/summary/page"),
  { ssr: false }
);

export default function Page() {
  const params = useParams() as { orgSlug?: string; id?: string } | null;
  const orgSlug = params?.orgSlug;
  const id = params?.id ?? "";

  useEffect(() => {
    if (orgSlug) {
      (globalThis as any).__INTIME_ORG_SLUG__ = orgSlug;
    }
    return () => {
      if ((globalThis as any).__INTIME_ORG_SLUG__ === orgSlug) {
        delete (globalThis as any).__INTIME_ORG_SLUG__;
      }
    };
  }, [orgSlug]);

  // Preserve legacy contract
  return <Legacy params={{ id } as any} />;
}
