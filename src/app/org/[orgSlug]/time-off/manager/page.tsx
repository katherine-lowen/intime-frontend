"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

// Load legacy client page without SSR
const Legacy = dynamic(() => import("../../../../timeoff/manager/page"), { ssr: false });

export default function Page() {
  // Make org slug available to any legacy code that uses __INTIME_ORG_SLUG__
  const params = useParams() as { orgSlug?: string } | null;
  (globalThis as any).__INTIME_ORG_SLUG__ = params?.orgSlug ?? "";

  return <Legacy />;
}
