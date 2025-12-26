"use client";

import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/performance/cycles/[id]/page"), {
  ssr: false,
});

export default function Page() {
  return <Legacy />;
}
