import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Board = {
  id: string;
  title: string;
  description: string | null;
  board_type: string;
  is_public: boolean;
  slug: string;
  created_at: string;
};

type Note = {
  id: string;
  created_at: string;
  content: string;
  board_id: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function PublicBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: board, error: boardErr } = await supabase
    .from("boards")
    .select("id,title,description,board_type,is_public,slug,created_at")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (boardErr || !board) notFound();

  // For now, only public render notes boards
  if (board.board_type !== "notes") notFound();

  const { data: notes, error: notesErr } = await supabase
    .from("notes")
    .select("id,created_at,content,board_id")
    .eq("board_id", board.id)
    .order("created_at", { ascending: true });

  if (notesErr) {
    // Don’t leak internals on a public page
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="text-xs text-gray-500">Public board</div>
      <h1 className="mt-1 text-3xl font-semibold">{board.title}</h1>

      {board.description ? (
        <p className="mt-3 text-base">{board.description}</p>
      ) : null}

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3">Notes</h2>

        {!notes || notes.length === 0 ? (
          <p className="text-sm text-gray-600">No notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="border rounded-lg p-3">
                <div className="text-sm whitespace-pre-wrap">{n.content}</div>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
