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

  const { data: userData } = await supabase.auth.getUser();
  const isLoggedIn = !!userData?.user;

  // Find links board
  const { data: board } = await supabase
    .from("boards")
    .select("id")
    .eq("org_slug", slug)
    .eq("board_type", "links")
    .maybeSingle();

  if (!board?.id) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Links</h1>
        <p className="text-gray-600 mt-2">No links board found.</p>
      </main>
    );
  }

  // Fetch pins
  const { data: pins } = await supabase
    .from("pins")
    .select("id,content,url,created_at")
    .eq("board_id", board.id)
    .order("created_at", { ascending: false });

  const rows = (pins ?? []) as Pin[];

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Links</h1>
        <Link className="underline text-sm" href={`/orgs/${slug}`}>
          Back
        </Link>
      </div>

      <p className="text-gray-600 mt-2">Organisation: {org.name}</p>

      {/* Add link form (logged-in only) */}
      {isLoggedIn ? (
        <form
          className="mt-6 border rounded-lg p-4 space-y-3"
          method="post"
          action="/api/pins"
        >
          <input type="hidden" name="boardId" value={board.id} />

          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              name="content"
              type="text"
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              placeholder="e.g. Programme spreadsheet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">URL</label>
            <input
              name="url"
              type="text"
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              placeholder="www.google.com or https://..."
              required
            />
          </div>

          <button
            type="submit"
            className="inline-block bg-black text-white text-sm px-4 py-2 rounded"
          >
            Add link
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-gray-600">
          <Link className="underline" href={`/login?next=/orgs/${slug}/links`}>
            Sign in
          </Link>{" "}
          to add links.
        </p>
      )}

      {/* Links list */}
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
