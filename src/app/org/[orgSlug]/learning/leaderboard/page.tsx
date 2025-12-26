import LeaderboardClient from "./LeaderboardClient";

export default async function LearningLeaderboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <LeaderboardClient orgSlug={orgSlug} />;
}
