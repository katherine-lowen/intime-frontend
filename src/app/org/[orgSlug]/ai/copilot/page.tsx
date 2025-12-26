"use client";
import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/ai/copilot/page"), { ssr: false });

export default function Page() {
  return <Legacy />;
}
