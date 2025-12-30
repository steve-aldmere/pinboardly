// app/orgs/[slug]/page.tsx
import { redirect } from "next/navigation";

export default function OrgSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/orgs/${params.slug}/links`);
}
