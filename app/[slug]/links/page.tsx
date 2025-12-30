// app/[slug]/links/page.tsx
import { redirect } from "next/navigation";

export default async function PublicLinksRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/orgs/${slug}/links`);
}
