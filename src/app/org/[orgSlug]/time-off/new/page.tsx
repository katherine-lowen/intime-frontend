"use client";
import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/timeoff/new/page"), { ssr: false });

export default function Page() {
  return <Legacy />;
}
