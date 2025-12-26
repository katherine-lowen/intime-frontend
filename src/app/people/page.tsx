"use client";

import dynamic from "next/dynamic";

const LegacyPeople = dynamic(() => import("@/app/people/legacy-page"), {
  ssr: false,
});

export default function OrgPeoplePage() {
  return <LegacyPeople />;
}
