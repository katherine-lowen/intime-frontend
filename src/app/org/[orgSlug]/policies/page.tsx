"use client";

import StubPage from "@/components/stubs/StubPage";

export default function PoliciesPage() {
  return (
    <StubPage
      title="Policies"
      description="Draft, publish, and track acknowledgement of policies (coming soon)."
      bullets={[
        "Centralize company policies.",
        "Collect acknowledgements.",
        "Keep version history and audit trails.",
      ]}
      primaryCta={{
        label: "Open Time off policies",
        href: (org) => `/org/${org}/time-off/policies`,
      }}
    />
  );
}
