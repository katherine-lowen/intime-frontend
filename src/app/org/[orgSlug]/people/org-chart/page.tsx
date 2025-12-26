"use client";
import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/people/org-chart/page"), { ssr: false });

export default function Page() {
  return <Legacy />;
}
