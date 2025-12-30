import { redirect } from "next/navigation";

export default function SlugCalendarRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/orgs/${params.slug}/calendar`);
}
