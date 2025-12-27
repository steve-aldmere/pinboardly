// app/api/notes/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/notes?boardId=... (or board_id=...) -> list notes for a board
export async function GET(req: Request) {
  const url = new URL(req.url);
  const boardId = url.searchParams.get("boardId") || url.searchParams.get("board_id") || "";

  if (!boardId) {
    return NextResponse.json({ error: "Missing boardId" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // RLS decides what you can see:
  // - public board => anyone (anon) can read
  // - private board => only permitted authenticated users can read
  const { data, error } = await supabase
    .from("notes")
    .select("id, content, created_at, board_id, created_by")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ notes: data ?? [] }, { status: 200 });
}

// POST /api/notes  body: { boardId, content }
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const boardId = typeof body.boardId === "string" ? body.boardId : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!boardId || !content) {
    return NextResponse.json({ error: "boardId and content are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      board_id: boardId,
      content,
      created_by: userData.user.id,
    })
    .select("id, content, created_at, board_id, created_by")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ note: data }, { status: 201 });
}

// DELETE /api/notes?id=...  (or JSON body { id })
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const idFromQuery = url.searchParams.get("id");

  let id = idFromQuery || "";
  if (!id) {
    const body = await req.json().catch(() => ({}));
    if (typeof body.id === "string") id = body.id;
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // RLS enforces whether this user is allowed to delete
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
