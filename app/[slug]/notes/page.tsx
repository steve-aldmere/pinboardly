import { redirect } from "next/navigation";

export default function SlugNotesRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/orgs/${params.slug}/notes`);
}
