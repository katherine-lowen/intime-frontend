"use client";
import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/timeoff/policies/new/page"), { ssr: false });

export default function Page() {
  return <Legacy />;
}
