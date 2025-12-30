// app/orgs/[slug]/links/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getOrgBySlug } from "../org";

type Pin = {
  id: string;
  content: string | null;
  url: string | null;
  created_at: string | null;
};

function Locked() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Subscription required</h1>
      <p className="text-gray-600 mt-2">
        This organisation’s boards are locked until a trial or paid subscription is active.
      </p>
    </main>
  );
}

export default async function LinksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { org, isActive } = await getOrgBySlug(slug);
  if (!org) notFound();
  if (!isActive) return <Locked />;

  const supabase = await createServerSupabaseClient();

  // Find the links board for this org
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id")
    .eq("org_slug", slug)
    .eq("board_type", "links")
    .maybeSingle();

  if (boardError) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Links</h1>
        <p className="text-red-600 text-sm mt-2">{boardError.message}</p>
      </main>
    );
  }

  if (!board?.id) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Links</h1>
        <p className="text-gray-600 mt-2">
          No links board found for this organisation yet.
        </p>
      </main>
    );
  }

  // Fetch pins for that board (these are the links)
  const { data: pins, error: pinsError } = await supabase
    .from("pins")
    .select("id,content,url,created_at")
    .eq("board_id", board.id)
    .order("created_at", { ascending: false });

  if (pinsError) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Links</h1>
        <p className="text-red-600 text-sm mt-2">{pinsError.message}</p>
      </main>
    );
  }

  const rows = (pins ?? []) as Pin[];

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Links</h1>
        <Link className="underline text-sm" href={`/orgs/${slug}`}>
          Back
        </Link>
      </div>

      <p className="text-gray-600 mt-2">Organisation: {org.name}</p>

      {rows.length === 0 ? (
        <p className="text-gray-600 mt-6">No links yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((p) => {
            const href = p.url?.trim() || "";
            const title = (p.content?.trim() || href || "Link").slice(0, 140);

            return (
              <div key={p.id} className="border rounded-lg p-4">
                <div className="font-medium">{title}</div>
                {href ? (
                  <div className="mt-2 text-sm">
                    <a
                      className="underline break-all"
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {href}
                    </a>
                  </div>
                ) : null}
                {p.created_at ? (
                  <div className="mt-2 text-xs text-gray-500">
                    Added: {new Date(p.created_at).toLocaleString()}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
