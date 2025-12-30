// app/orgs/[slug]/notes/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getOrgBySlug } from "../org";

type Pin = {
  id: string;
  content: string | null;
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

export default async function NotesPage({
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

  // Find the notes board for this org
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id")
    .eq("org_slug", slug)
    .eq("board_type", "notes")
    .maybeSingle();

  if (boardError) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Notes</h1>
        <p className="text-red-600 text-sm mt-2">{boardError.message}</p>
      </main>
    );
  }

  if (!board?.id) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Notes</h1>
        <p className="text-gray-600 mt-2">No notes board found.</p>
      </main>
    );
  }

  // Fetch notes pins
  const { data: pins, error: pinsError } = await supabase
    .from("pins")
    .select("id,content,created_at")
    .eq("board_id", board.id)
    .order("created_at", { ascending: false });

  if (pinsError) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Notes</h1>
        <p className="text-red-600 text-sm mt-2">{pinsError.message}</p>
      </main>
    );
  }

  const rows = (pins ?? []) as Pin[];

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notes</h1>
        <Link className="underline text-sm" href={`/orgs/${slug}`}>
          Back
        </Link>
      </div>

      <p className="text-gray-600 mt-2">Organisation: {org.name}</p>

      {/* Add note (logged-in only) */}
      {isLoggedIn ? (
        <form
          className="mt-6 border rounded-lg p-4 space-y-3"
          method="post"
          action="/api/pins"
        >
          <input type="hidden" name="boardId" value={board.id} />

          <div>
            <label className="block text-sm font-medium">New note</label>
            <textarea
              name="content"
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              rows={4}
              placeholder="Type your note..."
              required
            />
          </div>

          <button
            type="submit"
            className="inline-block bg-black text-white text-sm px-4 py-2 rounded"
          >
            Add note
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-gray-600">
          <Link className="underline" href={`/login?next=/orgs/${slug}/notes`}>
            Sign in
          </Link>{" "}
          to add or delete notes.
        </p>
      )}

      {/* Notes list */}
      {rows.length === 0 ? (
        <p className="text-gray-600 mt-6">No notes yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((p) => (
            <div key={p.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 whitespace-pre-wrap text-sm">
                  {p.content || "(empty note)"}
                </div>

                {isLoggedIn ? (
                  <form method="post" action="/api/pins/delete">
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="text-sm underline text-gray-600"
                    >
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>

              {p.created_at ? (
                <div className="mt-2 text-xs text-gray-500">
                  Added: {new Date(p.created_at).toLocaleString()}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
