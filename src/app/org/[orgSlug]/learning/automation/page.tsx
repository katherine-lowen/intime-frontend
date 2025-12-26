import AutomationClient from "./AutomationClient";

export default async function LearningAutomationPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <AutomationClient orgSlug={orgSlug} />;
}
