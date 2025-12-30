import { redirect } from "next/navigation";

export default function SlugLinksRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/orgs/${params.slug}/links`);
}
