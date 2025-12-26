"use client";
import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/timeoff/requests/page"), { ssr: false });

export default function Page() {
  return <Legacy />;
}
