"use client";

import { useEffect, useState } from "react";
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
  org_slug: string;
  created_at: string;
};

export default function BoardPageClient({ id }: { id: string }) {
  const supabase = getSupabaseClient();
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function deleteBoard() {
    if (!board) return;

    const ok = window.confirm(
      `Delete board "${board.title}"? This cannot be undone.`
    );
    if (!ok) return;

    setDeleting(true);
    setErrorMsg("");

    const { error } = await supabase.from("boards").delete().eq("id", board.id);

    setDeleting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push(`/${board.org_slug}`);
    router.refresh();
  }

  const backHref = board?.org_slug ? `/${board.org_slug}` : "/";

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
          <h1 className="text-2xl font-semibold">Error loading board</h1>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem talking to the server.
          </p>
          <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
        </div>
      ) : !board ? (
        <p className="mt-6 text-sm text-gray-600">Board not found.</p>
      ) : (
        <div className="mt-6">
          <h1 className="text-3xl font-semibold">{board.title}</h1>

          <div className="mt-2 text-sm text-gray-600">
            {board.board_type} · {board.is_public ? "Public" : "Private"} ·{" "}
            {board.slug}
          </div>

          {board.description ? (
            <p className="mt-4 text-base">{board.description}</p>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No description.</p>
          )}

          <div className="mt-8 rounded border p-4 text-sm text-gray-600">
            Next step is to render board content (notes, links, calendar) here.
          </div>
        </div>
      )}
    </div>
  );
}
