"use client";

import StubPage from "@/components/stubs/StubPage";

export default function OperationsPage() {
  return (
    <StubPage
      title="Operations"
      description="Keep people operations organized with clear ownership, metrics, and repeatable workflows."
      bullets={[
        "Monitor headcount, hiring, and attrition in one place.",
        "Surface cross-team blockers for people ops.",
        "Create playbooks for recurring operational tasks.",
      ]}
      primaryCta={{
        label: "Open People hub",
        href: (org) => `/org/${org}/people`,
      }}
    />
  );
}
