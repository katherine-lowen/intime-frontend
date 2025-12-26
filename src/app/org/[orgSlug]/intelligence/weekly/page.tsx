import WeeklySnapshotClient from "./WeeklySnapshotClient";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export default async function WeeklySnapshotPage({ params }: Props) {
  const { orgSlug } = await params;
  return <WeeklySnapshotClient orgSlug={orgSlug} />;
}
