// app/orgs/[slug]/OrgPageClient.tsx
"use client";

import Link from "next/link";

type Org = {
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  is_public: boolean;
};

type Board = {
  id: string;
  title: string;
  description: string | null;
  board_type: string;
  is_public: boolean;
  slug: string;
  created_at: string;
  org_slug: string | null;
};

function toStringSafe(v: unknown) {
  if (typeof v === "string") return v;
  if (v == null) return "";
  try {
    return String(v);
  } catch {
    return "";
  }
}

export default function OrgPageClient({
  org,
  boards,
  isLoggedIn,
  isOrgAdmin,
}: {
  org: Org;
  boards: Board[];
  isLoggedIn: boolean;
  isOrgAdmin: boolean;
}) {
  const slug = org.slug;
  const orgHref = `/${encodeURIComponent(slug)}`;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 pb-20">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pinboardly-icon.svg"
              alt="Pinboardly"
              className="h-8 w-8"
            />
            <h1 className="text-3xl font-semibold">
              {toStringSafe(org.name) || slug}
            </h1>
          </div>

          {org.description ? (
            <p className="text-gray-700 mt-2">{org.description}</p>
          ) : (
            <p className="text-gray-500 mt-2">No description.</p>
          )}

          <div className="mt-4 flex gap-4 text-sm">
            <Link className="underline" href={orgHref}>
              View boards for this organisation
            </Link>

            {!isLoggedIn ? (
              <Link className="underline" href="/login">
                Sign in
              </Link>
            ) : null}
          </div>

          {isLoggedIn ? (
            <div className="mt-3 text-sm text-gray-600">
              Role: {isOrgAdmin ? "admin" : "member"}
            </div>
          ) : null}
        </div>

        {org.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={org.logo_url}
            alt={`${toStringSafe(org.name) || slug} logo`}
            className="w-20 h-20 rounded-lg object-cover border"
          />
        ) : null}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Boards</h2>

          {isOrgAdmin ? (
            <Link
              href={orgHref}
              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg"
            >
              Create board
            </Link>
          ) : null}
        </div>

        {boards.length === 0 ? (
          <p className="text-gray-600 mt-4">No boards yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {boards.map((b) => (
              <div key={b.id} className="border rounded-lg p-4">
                <div className="font-medium">{b.title}</div>
                <div className="text-sm text-gray-600">
                  {b.board_type} · {b.is_public ? "Public" : "Private"}
                </div>

                {b.description ? (
                  <div className="text-sm text-gray-700 mt-1">
                    {b.description}
                  </div>
                ) : null}

                <div className="mt-3 text-sm">
                  <Link className="underline" href={`/boards/${b.id}`}>
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isOrgAdmin ? (
          <p className="text-xs text-gray-500 mt-6">
            Only organisation admins can create boards.
          </p>
        ) : null}
      </div>
    </div>
  );
}
