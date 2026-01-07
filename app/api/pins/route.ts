// app/api/pins/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { z } from "zod";

// Zod schemas for pin validation
const uuidSchema = z.string().uuid();

const linkPinSchema = z.object({
  type: z.literal("link"),
  pinboard_id: uuidSchema,
  title: z.string().min(1).max(120),
  url: z.string().url().min(1).max(2048),
  description: z.string().max(500).optional(),
});

const notePinSchema = z.object({
  type: z.literal("note"),
  pinboard_id: uuidSchema,
  title: z.string().min(1).max(120),
  body: z.string().max(10000).optional(),
});

const eventPinSchema = z.object({
  type: z.literal("event"),
  pinboard_id: uuidSchema,
  title: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date string (YYYY-MM-DD)"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be HH:MM format").optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
});

const createPinSchema = z.discriminatedUnion("type", [
  linkPinSchema,
  notePinSchema,
  eventPinSchema,
]);

const updatePinSchema = z.discriminatedUnion("type", [
  linkPinSchema.extend({ id: uuidSchema }),
  notePinSchema.extend({ id: uuidSchema }),
  eventPinSchema.extend({ id: uuidSchema }),
]);

const deletePinSchema = z.object({
  id: uuidSchema,
  pinboard_id: uuidSchema,
});

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
  try {
    const supabase = await createServerSupabaseClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let body: any = {};
    if (contentType.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
      // Map form fields to expected schema fields
      if (body.boardId) body.pinboard_id = body.boardId;
      if (body.content && !body.body) body.body = body.content;
      if (body.event_date && !body.date) body.date = body.event_date;
    }

    // Validate if type is provided (new format)
    if (body.type) {
      const validation = createPinSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation error",
            details: validation.error.issues,
          },
          { status: 400 }
        );
      }
    }

    // Legacy format handling (preserve existing behavior)
    let boardId = "";
    let title = "";
    let content = "";
    let urlVal = "";
    let eventDateVal = "";

    if (contentType.includes("application/json")) {
      boardId = asString(body.boardId || body.pinboard_id).trim();
      title = asString(body.title).trim();
      content = asString(body.content || body.body).trim();
      urlVal = asString(body.url).trim();
      eventDateVal = asString(body.event_date || body.date).trim();
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
  } catch (error) {
    console.error("Unexpected error in POST /api/pins:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// PATCH /api/pins
export async function PATCH(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Validate update request
    const validation = updatePinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // Business logic would go here (preserved from update route)
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/pins:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// DELETE /api/pins?id=...
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const idFromQuery = url.searchParams.get("id");

    let id = idFromQuery || "";
    let pinboardId = url.searchParams.get("pinboard_id") || "";
    
    if (!id || !pinboardId) {
      const body = await req.json().catch(() => ({}));
      if (typeof body.id === "string") id = body.id;
      if (typeof body.pinboard_id === "string") pinboardId = body.pinboard_id;
    }

    // Validate delete request
    const validation = deletePinSchema.safeParse({ id, pinboard_id: pinboardId });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validation.error.issues,
        },
        { status: 400 }
      );
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
  } catch (error) {
    console.error("Unexpected error in DELETE /api/pins:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
