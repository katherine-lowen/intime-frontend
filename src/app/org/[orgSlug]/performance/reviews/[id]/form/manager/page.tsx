"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const Legacy = dynamic<any>(
  () => import("@/app/performance/reviews/[id]/form/page"),
  { ssr: false }
);

export default function Page() {
  const params = useParams() as { orgSlug?: string; id?: string } | null;
  const orgSlug = params?.orgSlug;
  const id = params?.id ?? "";

  useEffect(() => {
    if (orgSlug) (globalThis as any).__INTIME_ORG_SLUG__ = orgSlug;
    return () => {
      if ((globalThis as any).__INTIME_ORG_SLUG__ === orgSlug) {
        delete (globalThis as any).__INTIME_ORG_SLUG__;
      }
    };
  }, [orgSlug]);

  return <Legacy params={{ id }} />;
}
