"use client";

import StubPage from "@/components/stubs/StubPage";

export default function ObsessionPage() {
  return (
    <StubPage
      title="Obsession"
      description="The command center for doing the small things that keep the org healthy."
      bullets={[
        "Track recurring HR ops tasks.",
        "Auto-surface what’s overdue.",
        "Turn insights into action items.",
      ]}
      primaryCta={{
        label: "Open Dashboard",
        href: (org) => `/org/${org}/dashboard`,
      }}
    />
  );
}
