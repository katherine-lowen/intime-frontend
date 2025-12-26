import HeadcountPlansClient from "./HeadcountPlansClient";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export default async function HeadcountPlansPage({ params }: Props) {
  const { orgSlug } = await params;
  return <HeadcountPlansClient orgSlug={orgSlug} />;
}
