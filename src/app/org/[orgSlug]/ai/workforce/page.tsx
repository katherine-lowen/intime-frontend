"use client";
import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/ai/workforce/page"), { ssr: false });

export default function Page() {
  return <Legacy />;
}
