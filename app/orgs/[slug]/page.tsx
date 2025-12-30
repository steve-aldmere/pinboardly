// app/orgs/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrgBySlug } from "./org";

export default async function OrgHomePage({
  params,
}: {
  params: { slug: string };
}) {
  const { org, isActive } = await getOrgBySlug(params.slug);

  if (!org) notFound();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">{org.name}</h1>

      {!isActive && (
        <p className="mt-2 text-sm text-gray-600">
          This board is currently locked.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2 text-sm">
        <Link href={`/orgs/${org.slug}/links`} className="underline">
          Links
        </Link>
        <Link href={`/orgs/${org.slug}/notes`} className="underline">
          Notes
        </Link>
        <Link href={`/orgs/${org.slug}/calendar`} className="underline">
          Calendar
        </Link>
      </div>
    </main>
  );
}
