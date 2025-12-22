import OrgPageClient from "./OrgPageClient";

export default async function OrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <OrgPageClient slug={slug} />;
}
