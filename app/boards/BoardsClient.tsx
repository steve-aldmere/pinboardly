"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

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

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSuffix(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function BoardsClient({
  initialBoards,
  initialError,
}: {
  initialBoards?: Board[];
  initialError?: string;
}) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>(initialBoards ?? []);
  const [errorMsg, setErrorMsg] = useState(initialError ?? "");

  const [title, setTitle] = useState("");
  const [boardType, setBoardType] = useState<"notes" | "links" | "calendar">("notes");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  async function refreshBoards() {
    const { data, error } = await supabase
      .from("boards")
      .select("id,title,description,board_type,is_public,slug,created_at,org_slug")
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setBoards((data ?? []) as Board[]);
  }

  useEffect(() => {
    if (boards.length === 0) refreshBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg("Please enter a board title.");
      return;
    }

    setLoading(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const base = slugify(cleanTitle);
    const slug = `${base}-${randomSuffix(6)}`;

    const { data, error } = await supabase
      .from("boards")
      .insert({
        title: cleanTitle,
        description: description.trim() ? description.trim() : null,
        board_type: boardType,
        is_public: isPublic,
        slug,
        org_slug: null,
        created_by: userData.user.id,
      } as any)
      .select("id,title,description,board_type,is_public,slug,created_at,org_slug")
      .single();

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setTitle("");
    setBoardType("notes");
    setDescription("");
    setIsPublic(true);

    setBoards((prev) => [...prev, data as Board]);
  }

  async function deleteBoard(id: string) {
    const ok = window.confirm("Delete this board? This cannot be undone.");
    if (!ok) return;

    setErrorMsg("");
    const { error } = await supabase.from("boards").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setBoards((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6 pb-20">
      <h1 className="text-3xl font-semibold mb-6">Your boards</h1>

      <div className="p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-lg font-medium mb-4">Create a new board</h2>

        <form onSubmit={createBoard} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Board title"
            className="w-full border rounded-lg p-3"
            required
          />

          <select
            value={boardType}
            onChange={(e) => setBoardType(e.target.value as any)}
            className="w-full border rounded-lg p-3"
          >
            <option value="notes">Notes</option>
            <option value="links">Links</option>
            <option value="calendar">Calendar</option>
          </select>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="w-full border rounded-lg p-3"
          />

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public board
          </label>

          {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create board"}
          </button>
        </form>
      </div>

      {boards.length === 0 ? (
        <p className="text-gray-600">No boards yet.</p>
      ) : (
        <div className="space-y-4">
          {boards.map((b) => (
            <div key={b.id} className="border rounded-lg p-4">
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-gray-600">
                {b.board_type} · {b.is_public ? "Public" : "Private"}
              </div>

              <div className="mt-3 flex gap-3 text-sm">
                <Link className="underline" href={`/boards/${b.id}`}>
                  Open
                </Link>
                <button className="underline" onClick={() => deleteBoard(b.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
