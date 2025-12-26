import OnboardingClient from "./OnboardingClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <OnboardingClient orgSlug={orgSlug} />;
}
