import TasksClient from "./TasksClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <TasksClient orgSlug={orgSlug} />;
}
