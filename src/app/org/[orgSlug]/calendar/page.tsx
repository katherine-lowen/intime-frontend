"use client";

import StubPage from "@/components/stubs/StubPage";

export default function CalendarPage() {
  return (
    <StubPage
      title="Calendar"
      description="A unified people calendar for PTO, interviews, and milestones (coming soon)."
      bullets={[
        "See who’s out and when.",
        "Overlay interviews and hiring pipeline.",
        "Track anniversaries and milestones.",
      ]}
      primaryCta={{
        label: "Open Time off calendar",
        href: (org) => `/org/${org}/time-off/calendar`,
      }}
    />
  );
}
