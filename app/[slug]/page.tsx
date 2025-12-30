// app/[slug]/page.tsx
import { redirect } from "next/navigation";

export default async function PublicOrgSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/orgs/${slug}`);
}
