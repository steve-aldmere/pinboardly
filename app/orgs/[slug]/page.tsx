// app/orgs/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrgBySlug } from "./org";

export default async function OrgHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) notFound();

  const { org, isActive } = await getOrgBySlug(slug);
  if (!org) notFound();

  // If you later want to hide content when not active, use isActive here.
  // For now we just render the simple board index.

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-semibold">{org.name ?? slug}</h1>

      <div className="mt-6 space-y-2 text-lg">
        <div>
          <Link className="underline" href={`/orgs/${slug}/links`}>
            Links
          </Link>
        </div>
        <div>
          <Link className="underline" href={`/orgs/${slug}/notes`}>
            Notes
          </Link>
        </div>
        <div>
          <Link className="underline" href={`/orgs/${slug}/calendar`}>
            Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
