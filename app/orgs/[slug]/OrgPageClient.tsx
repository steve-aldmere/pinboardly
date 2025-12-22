"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type Org = {
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
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

export default function OrgPageClient({ slug }: { slug: string }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [boardType, setBoardType] = useState<"notes" | "links" | "calendar">("notes");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadOrgAndRole() {
    setLoading(true);
    setErrorMsg("");

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      router.push("/login");
      return;
    }

    const { data: orgData, error: orgErr } = await supabase
      .from("orgs")
      .select("slug,name,description,logo_url,primary_color,accent_color")
      .eq("slug", slug)
      .single();

    if (orgErr) {
      setOrg(null);
      setErrorMsg(orgErr.message);
      setLoading(false);
      return;
    }

    setOrg(orgData as Org);

    const { data: membership, error: memErr } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_slug", slug)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (memErr) {
      setIsAdmin(false);
    } else {
      setIsAdmin(membership?.role === "admin");
    }

    setLoading(false);
  }

  async function loadBoards() {
    setBoardsLoading(true);

    const { data, error } = await supabase
      .from("boards")
      .select("id,title,description,board_type,is_public,slug,created_at,org_slug")
      .eq("org_slug", slug)
      .order("created_at", { ascending: true });

    setBoardsLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setBoards((data ?? []) as Board[]);
  }

  useEffect(() => {
    loadOrgAndRole().then(() => loadBoards());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!isAdmin) {
      setErrorMsg("Only org admins can create boards.");
      return;
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg("Please enter a board title.");
      return;
    }

    setCreating(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setCreating(false);
      router.push("/login");
      return;
    }

    const base = slugify(cleanTitle);
    const newSlug = `${base}-${randomSuffix(6)}`;

    const { data, error } = await supabase
      .from("boards")
      .insert({
        title: cleanTitle,
        description: description.trim() ? description.trim() : null,
        board_type: boardType,
        is_public: isPublic,
        slug: newSlug,
        org_slug: slug,
        created_by: userData.user.id,
      } as any)
      .select("id,title,description,board_type,is_public,slug,created_at,org_slug")
      .single();

    setCreating(false);

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

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between">
        <Link href="/boards" className="text-sm underline">
          Back
        </Link>
        <Link href="/orgs/new" className="text-sm underline">
          New org
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">Loading org...</p>
      ) : errorMsg ? (
        <div className="mt-6">
          <h1 className="text-2xl font-semibold">Error</h1>
          <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
        </div>
      ) : !org ? (
        <p className="mt-6 text-sm text-gray-600">Org not found.</p>
      ) : (
        <div className="mt-6">
          <h1 className="text-3xl font-semibold">{org.name}</h1>
          <p className="mt-2 text-sm text-gray-600">/{org.slug}</p>

          {org.description ? (
            <p className="mt-4">{org.description}</p>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No description.</p>
          )}

          <div className="mt-6 text-sm text-gray-600">
            Role: {isAdmin ? "Admin" : "Member"}
          </div>

          {isAdmin ? (
            <div className="mt-8 p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Create a board in this org</h2>

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
                  disabled={creating}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create board"}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-8 rounded border p-4 text-sm text-gray-600">
              Only org admins can create boards.
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-lg font-medium mb-3">Org boards</h2>

            {boardsLoading ? (
              <p className="text-sm text-gray-600">Loading boards...</p>
            ) : boards.length === 0 ? (
              <p className="text-sm text-gray-600">No org boards yet.</p>
            ) : (
              <div className="space-y-4">
                {boards.map((b) => (
                  <div key={b.id} className="border rounded-lg p-4">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-sm text-gray-600">
                      {b.board_type} · {b.is_public ? "Public" : "Private"} · {b.slug}
                    </div>
                    <div className="mt-3 flex gap-3 text-sm">
                      <Link className="underline" href={`/boards/${b.id}`}>
                        Open
                      </Link>
                      <Link className="underline" href={`/b/${b.slug}`}>
                        Public link
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
