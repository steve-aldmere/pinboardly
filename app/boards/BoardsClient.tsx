"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

export default function BoardsClient({
  initialBoards,
  initialError,
}: {
  initialBoards?: Board[];
  initialError?: string;
}) {
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [boards, setBoards] = useState<Board[]>(initialBoards ?? []);
  const [errorMsg, setErrorMsg] = useState(initialError ?? "");

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

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6 pb-20">
      <h1 className="text-3xl font-semibold mb-6">Boards</h1>

      {errorMsg ? <p className="text-sm text-red-600 mb-4">{errorMsg}</p> : null}

      {boards.length === 0 ? (
        <p className="text-gray-600">No boards yet.</p>
      ) : (
        <div className="space-y-4">
          {boards.map((b) => (
            <div key={b.id} className="border rounded-lg p-4">
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-gray-600">
                {b.board_type} · {b.is_public ? "Public" : "Private"}
                {b.org_slug ? ` · ${b.org_slug}` : null}
              </div>

              {b.description ? (
                <div className="text-sm text-gray-700 mt-1">{b.description}</div>
              ) : null}

              <div className="mt-3 flex gap-3 text-sm">
                <Link className="underline" href={`/boards/${b.id}`}>
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
