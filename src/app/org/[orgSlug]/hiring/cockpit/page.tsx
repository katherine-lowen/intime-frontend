import HiringCockpitClient from "./HiringCockpitClient";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export default async function HiringCockpitPage({ params }: Props) {
  const { orgSlug } = await params;

  return <HiringCockpitClient orgSlug={orgSlug} />;
}
