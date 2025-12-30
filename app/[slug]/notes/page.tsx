// app/[slug]/notes/page.tsx
import { redirect } from "next/navigation";

export default async function PublicNotesRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/orgs/${slug}/notes`);
}
