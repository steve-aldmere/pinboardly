// app/api/pins/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { z } from "zod";

/**
 * NOTE:
 * - The old monolithic "pins" table is gone.
 * - We route reads/writes to: link_pins, note_pins, event_pins.
 * - For link_pins, sort_order is NOT NULL, so we must always set it on insert.
 */

const uuidSchema = z.string().uuid();

function normalizeUrl(input: string) {
  const s = (input || "").trim();
  if (!s) return "";
  // If user types www.google.com, treat as https://www.google.com
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

// ----------------------
// Zod Schemas
// ----------------------

const linkPinSchema = z.object({
  type: z.literal("link"),
  pinboard_id: uuidSchema,
  title: z.string().min(1).max(120),
  url: z.preprocess(
    (v) => (typeof v === "string" ? normalizeUrl(v) : v),
    z
      .string()
      .url()
      .min(1)
      .max(2048)
      .refine(
        (val) => {
          try {
            const u = new URL(val);
            const host = u.hostname;
            // allow localhost; otherwise require a dot in hostname
            return host === "localhost" || host.includes(".");
          } catch {
            return false;
          }
        },
        { message: "Enter a valid URL (eg google.com)" }
      )
  ),
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
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date string (YYYY-MM-DD)"),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be HH:MM format")
    .optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
});

const createPinSchema = z.discriminatedUnion("type", [
  linkPinSchema,
  notePinSchema,
  eventPinSchema,
]);

const deletePinSchema = z.object({
  id: uuidSchema,
  pinboard_id: uuidSchema,
  type: z.enum(["link", "note", "event"]).optional(),
});

// ----------------------
// Helpers
// ----------------------

function inferTypeFromBody(body: any): "link" | "note" | "event" {
  if (body?.type === "link" || body?.type === "note" || body?.type === "event") {
    return body.type;
  }
  if (body?.url) return "link";
  if (body?.date || body?.event_date) return "event";
  return "note";
}

function tableFromType(t: "link" | "note" | "event") {
  if (t === "link") return "link_pins";
  if (t === "note") return "note_pins";
  return "event_pins";
}

// ----------------------
// GET /api/pins?pinboard_id=... (&type=link|note|event optional)
// Returns either one type, or all three (combined) if type not provided.
// ----------------------
export async function GET(req: Request) {
  const url = new URL(req.url);
  const pinboardId =
    url.searchParams.get("pinboard_id") ||
    url.searchParams.get("pinboardId") ||
    url.searchParams.get("boardId") ||
    "";

  const typeParam = (url.searchParams.get("type") || "").trim() as
    | "link"
    | "note"
    | "event"
    | "";

  if (!pinboardId) {
    return NextResponse.json(
      { error: "Missing pinboard_id (or pinboardId/boardId)" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();

  // If caller asks for a single type, return just that.
  if (typeParam === "link") {
    const { data, error } = await supabase
      .from("link_pins")
      .select("id, pinboard_id, title, url, description, sort_order, created_at")
      .eq("pinboard_id", pinboardId)
      .order("sort_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ pins: data ?? [] }, { status: 200 });
  }

  if (typeParam === "note") {
    const { data, error } = await supabase
      .from("note_pins")
      .select("id, pinboard_id, title, body_markdown, sort_order, created_at")
      .eq("pinboard_id", pinboardId)
      .order("sort_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ pins: data ?? [] }, { status: 200 });
  }

  if (typeParam === "event") {
    const { data, error } = await supabase
      .from("event_pins")
      .select("id, pinboard_id, title, date, time, location, description, sort_order, created_at")
      .eq("pinboard_id", pinboardId)
      .order("sort_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ pins: data ?? [] }, { status: 200 });
  }

  // Otherwise return combined (useful for debugging / generic clients)
  const [linksRes, notesRes, eventsRes] = await Promise.all([
    supabase
      .from("link_pins")
      .select("id, pinboard_id, title, url, description, sort_order, created_at")
      .eq("pinboard_id", pinboardId),
    supabase
      .from("note_pins")
      .select("id, pinboard_id, title, body_markdown, sort_order, created_at")
      .eq("pinboard_id", pinboardId),
    supabase
      .from("event_pins")
      .select("id, pinboard_id, title, date, time, location, description, sort_order, created_at")
      .eq("pinboard_id", pinboardId),
  ]);

  if (linksRes.error) return NextResponse.json({ error: linksRes.error.message }, { status: 400 });
  if (notesRes.error) return NextResponse.json({ error: notesRes.error.message }, { status: 400 });
  if (eventsRes.error) return NextResponse.json({ error: eventsRes.error.message }, { status: 400 });

  const combined = [
    ...(linksRes.data ?? []).map((x) => ({ ...x, type: "link" as const })),
    ...(notesRes.data ?? []).map((x) => ({ ...x, type: "note" as const })),
    ...(eventsRes.data ?? []).map((x) => ({ ...x, type: "event" as const })),
  ].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return NextResponse.json({ pins: combined }, { status: 200 });
}

// ----------------------
// POST /api/pins
// Accepts JSON or FormData
// Required for link: type=link, pinboard_id, title, url
// We must set sort_order for link_pins (NOT NULL).
// ----------------------
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    const isFormEncoded =
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded");

    // Read request body exactly once
    let body: any = {};
    if (isFormEncoded) {
      const form = await req.formData();
      body = Object.fromEntries(
        [...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""])
      );
    } else {
      body = await req.json().catch(() => ({}));
    }

    // Map older naming if present
    if (body.boardId && !body.pinboard_id) body.pinboard_id = body.boardId;
    if (body.pinboardId && !body.pinboard_id) body.pinboard_id = body.pinboardId;

    // Notes field aliasing
    if (body.content && !body.body) body.body = body.content;

    // Events field aliasing
    if (body.event_date && !body.date) body.date = body.event_date;

    // Infer / normalize type
    body.type = inferTypeFromBody(body);

    // Validate
    const validation = createPinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Insert payload
    let tableName: string;
    let insertData: any = { pinboard_id: validatedData.pinboard_id };

    if (validatedData.type === "link") {
      tableName = "link_pins";
      insertData.title = validatedData.title;
      insertData.url = validatedData.url;
      if (validatedData.description) insertData.description = validatedData.description;

      // IMPORTANT: sort_order is NOT NULL
      const { data: last, error: lastErr } = await supabase
        .from("link_pins")
        .select("sort_order")
        .eq("pinboard_id", validatedData.pinboard_id)
        .order("sort_order", { ascending: false })
        .limit(1);

      if (lastErr) {
        return NextResponse.json({ error: lastErr.message }, { status: 400 });
      }

      const nextSortOrder = (last?.[0]?.sort_order ?? 0) + 1;
      insertData.sort_order = nextSortOrder;
    } else if (validatedData.type === "note") {
      tableName = "note_pins";
      insertData.title = validatedData.title;
      if (validatedData.body) insertData.body_markdown = validatedData.body;

      // If your DB has NOT NULL sort_order here too, uncomment this:
      // const { data: last, error: lastErr } = await supabase
      //   .from("note_pins")
      //   .select("sort_order")
      //   .eq("pinboard_id", validatedData.pinboard_id)
      //   .order("sort_order", { ascending: false })
      //   .limit(1);
      // if (lastErr) return NextResponse.json({ error: lastErr.message }, { status: 400 });
      // insertData.sort_order = (last?.[0]?.sort_order ?? 0) + 1;
    } else {
      tableName = "event_pins";
      insertData.title = validatedData.title;
      insertData.date = validatedData.date;
      if (validatedData.time) insertData.time = validatedData.time;
      if (validatedData.location) insertData.location = validatedData.location;
      if (validatedData.description) insertData.description = validatedData.description;

      // If your DB has NOT NULL sort_order here too, uncomment same pattern as above.
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Form posts redirect back
    if (!contentType.includes("application/json")) {
      const back = req.headers.get("referer") || "/orgs";
      return NextResponse.redirect(back, { status: 303 });
    }

    return NextResponse.json({ pin: data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/pins:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// ----------------------
// PATCH - not implemented here (your app seems to use server actions for edits)
// Keep stub so callers get a sane response.
// ----------------------
export async function PATCH() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

// ----------------------
// DELETE /api/pins?id=...&pinboard_id=...&type=link|note|event
// (Also accepts JSON body with same fields)
// ----------------------
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);

    let id = url.searchParams.get("id") || "";
    let pinboardId =
      url.searchParams.get("pinboard_id") ||
      url.searchParams.get("pinboardId") ||
      "";
    let type = (url.searchParams.get("type") || "").trim() as "link" | "note" | "event" | "";

    if (!id || !pinboardId || !type) {
      const body = await req.json().catch(() => ({}));
      if (!id) id = asString(body.id);
      if (!pinboardId) pinboardId = asString(body.pinboard_id || body.pinboardId);
      if (!type) type = asString(body.type) as any;
    }

    const validation = deletePinSchema.safeParse({ id, pinboard_id: pinboardId, type });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const t = (validation.data.type || "link") as "link" | "note" | "event";
    const table = tableFromType(t);

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .eq("pinboard_id", pinboardId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/pins:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
