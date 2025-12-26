"use client";

import StubPage from "@/components/stubs/StubPage";

export default function TalentPage() {
  return (
    <StubPage
      title="Talent hub"
      description="A unified view of sourcing, pipeline health, and hiring velocity."
      bullets={[
        "See pipeline health across roles.",
        "Spot bottlenecks by stage.",
        "Jump into recruiting workflows.",
      ]}
      primaryCta={{
        label: "Open Recruiting",
        href: (org) => `/org/${org}/hiring`,
      }}
    />
  );
}
