import InboxClient from "./InboxClient";

export default async function LearningInboxPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <InboxClient orgSlug={orgSlug} />;
}
