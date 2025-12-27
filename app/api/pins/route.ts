// app/api/pins/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/pins?boardId=... (or board_id=...) -> list pins for a board
export async function GET(req: Request) {
  const url = new URL(req.url);
  const boardId = url.searchParams.get("boardId") || url.searchParams.get("board_id") || "";

  if (!boardId) {
    return NextResponse.json({ error: "Missing boardId" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // RLS decides what you can see based on board visibility
  const { data, error } = await supabase
    .from("pins")
    .select("id, board_id, content, url, event_date, created_at, created_by")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ pins: data ?? [] }, { status: 200 });
}

// POST /api/pins  body: { boardId, content, url?, event_date? }
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const boardId = typeof body.boardId === "string" ? body.boardId : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const urlVal = typeof body.url === "string" ? body.url.trim() : "";
  const eventDateVal = typeof body.event_date === "string" ? body.event_date.trim() : "";

  if (!boardId) {
    return NextResponse.json({ error: "boardId is required" }, { status: 400 });
  }

  if (!content && !urlVal && !eventDateVal) {
    return NextResponse.json(
      { error: "Provide at least one of: content, url, event_date" },
      { status: 400 }
    );
  }

  const insertData: any = {
    board_id: boardId,
    created_by: userData.user.id,
  };

  if (content) insertData.content = content;
  if (urlVal) insertData.url = urlVal;
  if (eventDateVal) insertData.event_date = eventDateVal; // expect ISO string
  // created_at default should be set in DB; if not, it's fine to omit

  const { data, error } = await supabase
    .from("pins")
    .insert(insertData)
    .select("id, board_id, content, url, event_date, created_at, created_by")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ pin: data }, { status: 201 });
}

// DELETE /api/pins?id=... (or JSON body { id })
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

  // RLS enforces whether this user can delete
  const { error } = await supabase.from("pins").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
