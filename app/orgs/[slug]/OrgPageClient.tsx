"use client";

import Link from "next/link";

export default function OrgPageClient({
  slug,
  name,
  description,
}: {
  slug: string;
  name: string;
  description: string | null;
}) {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">{name}</h1>
      {description ? <p className="text-gray-600 mt-2">{description}</p> : null}

      <div className="mt-6 flex flex-col gap-3">
        <Link className="underline" href={`/orgs/${slug}/links`}>
          Links
        </Link>
        <Link className="underline" href={`/orgs/${slug}/notes`}>
          Notes
        </Link>
        <Link className="underline" href={`/orgs/${slug}/calendar`}>
          Calendar
        </Link>
      </div>
    </main>
  );
}
