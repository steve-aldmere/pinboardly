// app/[slug]/calendar/page.tsx
import { redirect } from "next/navigation";

export default async function PublicCalendarRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/orgs/${slug}/calendar`);
}
