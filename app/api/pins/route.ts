// app/api/pins/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function normalizeUrl(input: string) {
  const s = (input || "").trim();
  if (!s) return "";
  // If user types www.google.com, treat as https://www.google.com
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

function firstLineTitle(content: string) {
  const cleaned = (content || "").replace(/\r\n/g, "\n").trim();
  if (!cleaned) return "";
  const line =
    cleaned.split("\n").map((x) => x.trim()).filter(Boolean)[0] || "";
  return line.length > 80 ? `${line.slice(0, 80)}…` : line;
}

function titleFromUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.host.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const suffix = `${path}${u.search ? u.search : ""}`;
    return `${host}${suffix}`;
  } catch {
    return url.trim();
  }
}

function titleFromEventDate(eventDate: string) {
  const d = new Date(eventDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// GET /api/pins?boardId=... (or board_id=...) -> list pins for a board
export async function GET(req: Request) {
  const url = new URL(req.url);
  const boardId =
    url.searchParams.get("boardId") || url.searchParams.get("board_id") || "";

  if (!boardId) {
    return NextResponse.json({ error: "Missing boardId" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("pins")
    .select(
      "id, board_id, title, content, url, event_date, position, created_at, created_by"
    )
    .eq("board_id", boardId)
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ pins: data ?? [] }, { status: 200 });
}

// POST /api/pins
// Accepts either JSON { boardId, title?, content?, url?, event_date? }
// OR form fields: boardId, title, content, url, event_date
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";

  let boardId = "";
  let title = "";
  let content = "";
  let urlVal = "";
  let eventDateVal = "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    boardId = asString(body.boardId).trim();
    title = asString(body.title).trim();
    content = asString(body.content).trim();
    urlVal = asString(body.url).trim();
    eventDateVal = asString(body.event_date).trim();
  } else {
    const form = await req.formData();
    boardId = asString(form.get("boardId")).trim();
    title = asString(form.get("title")).trim();
    content = asString(form.get("content")).trim();
    urlVal = asString(form.get("url")).trim();
    eventDateVal = asString(form.get("event_date")).trim();
  }

  if (!boardId) {
    return NextResponse.json({ error: "boardId is required" }, { status: 400 });
  }

  urlVal = normalizeUrl(urlVal);

  if (!title && !content && !urlVal && !eventDateVal) {
    return NextResponse.json(
      { error: "Provide at least one of: title, content, url, event_date" },
      { status: 400 }
    );
  }

  // Default title rules if user didn't supply one
  if (!title) {
    if (content) title = firstLineTitle(content);
    else if (urlVal) title = titleFromUrl(urlVal);
    else if (eventDateVal) title = titleFromEventDate(eventDateVal);
  }

  const insertData: any = {
    board_id: boardId,
    created_by: userData.user.id,
  };

  if (title) insertData.title = title;
  if (content) insertData.content = content;
  if (urlVal) insertData.url = urlVal;
  if (eventDateVal) insertData.event_date = eventDateVal;

  const { data, error } = await supabase
    .from("pins")
    .insert(insertData)
    .select(
      "id, board_id, title, content, url, event_date, position, created_at, created_by"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If it was a browser form post, send the user back to where they came from
  if (!contentType.includes("application/json")) {
    const back = req.headers.get("referer") || "/orgs";
    return NextResponse.redirect(back, { status: 303 });
  }

  return NextResponse.json({ pin: data }, { status: 201 });
}

// DELETE /api/pins?id=...
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

  const { error } = await supabase.from("pins").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
