"use client";
import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/people/[id]/edit/page"), { ssr: false });

export default function Page() {
  return <Legacy />;
}
