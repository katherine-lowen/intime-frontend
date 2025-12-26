"use client";

import StubPage from "@/components/stubs/StubPage";

export default function RequestsPage() {
  return (
    <StubPage
      title="Requests"
      description="Track employee requests and approvals (coming soon)."
      bullets={[
        "Collect requests in one place.",
        "Route approvals to the right manager.",
        "Keep a searchable log.",
      ]}
      primaryCta={{
        label: "Open Time off requests",
        href: (org) => `/org/${org}/time-off/requests`,
      }}
    />
  );
}
