"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabase";

type Board = {
  id: string;
  title: string;
  description: string | null;
  board_type: string;
  is_public: boolean;
  slug: string;
  org_slug: string | null;
  created_at: string;
};

type Note = {
  id: string;
  created_at: string;
  content: string;
  board_id: string;
  created_by: string;
};

export default function BoardPageClient({ id }: { id: string }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  async function loadBoard() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("boards")
      .select("id,title,description,board_type,is_public,slug,org_slug,created_at")
      .eq("id", id)
      .single();

    if (error) {
      setBoard(null);
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setBoard(data as Board);
    setLoading(false);
  }

  async function loadNotes() {
    setNotesLoading(true);

    const { data, error } = await supabase
      .from("notes")
      .select("id,created_at,content,board_id,created_by")
      .eq("board_id", id)
      .order("created_at", { ascending: true });

    setNotesLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setNotes((data ?? []) as Note[]);
  }

  useEffect(() => {
    loadBoard();
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function deleteBoard() {
    if (!board) return;

    const ok = window.confirm(`Delete board "${board.title}"? This cannot be undone.`);
    if (!ok) return;

    setDeleting(true);
    setErrorMsg("");

    const { error } = await supabase.from("boards").delete().eq("id", board.id);

    setDeleting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // For now, return to /boards (org routing comes later)
    router.push("/boards");
    router.refresh();
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const content = noteDraft.trim();
    if (!content) return;

    setNoteSaving(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setNoteSaving(false);
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({
        board_id: id,
        created_by: userData.user.id,
        content,
      } as any)
      .select("id,created_at,content,board_id,created_by")
      .single();

    setNoteSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setNoteDraft("");
    setNotes((prev) => [...prev, data as Note]);
  }

  async function deleteNote(noteId: string) {
    const ok = window.confirm("Delete this note?");
    if (!ok) return;

    setErrorMsg("");

    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  const backHref = "/boards";

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between">
        <Link href={backHref} className="text-sm underline">
          Back
        </Link>

        <button
          onClick={deleteBoard}
          disabled={deleting || !board}
          className="text-sm border rounded px-3 py-2 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete board"}
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">Loading board...</p>
      ) : errorMsg ? (
        <div className="mt-6">
          <h1 className="text-2xl font-semibold">Error</h1>
          <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
        </div>
      ) : !board ? (
        <p className="mt-6 text-sm text-gray-600">Board not found.</p>
      ) : (
        <div className="mt-6">
          <h1 className="text-3xl font-semibold">{board.title}</h1>

          <div className="mt-2 text-sm text-gray-600">
            {board.board_type} · {board.is_public ? "Public" : "Private"} · {board.slug}
          </div>

          {board.description ? (
            <p className="mt-4 text-base">{board.description}</p>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No description.</p>
          )}

          {/* Notes UI (we’ll only show it for notes boards for now) */}
          {board.board_type === "notes" ? (
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-3">Notes</h2>

              <form onSubmit={createNote} className="space-y-3">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Write a note..."
                  className="w-full border rounded-lg p-3"
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={noteSaving}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                  {noteSaving ? "Saving..." : "Add note"}
                </button>
              </form>

              <div className="mt-6">
                {notesLoading ? (
                  <p className="text-sm text-gray-600">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-gray-600">No notes yet.</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((n) => (
                      <div key={n.id} className="border rounded-lg p-3">
                        <div className="text-sm whitespace-pre-wrap">{n.content}</div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                          <button className="underline" onClick={() => deleteNote(n.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded border p-4 text-sm text-gray-600">
              This board type is “{board.board_type}”. Notes UI will only render on Notes boards.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
