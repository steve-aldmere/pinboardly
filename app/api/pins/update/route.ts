import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { z } from "zod";

const uuidSchema = z.string().uuid();

function normalizeUrl(input: string) {
  const s = (input || "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

// We accept both JSON + FormData
async function readBody(req: Request): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type") || "";
  const isFormEncoded =
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded");

  if (isFormEncoded) {
    const form = await req.formData();
    return Object.fromEntries(
      [...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""])
    );
  }

  return await req.json().catch(() => ({}));
}

// Schema: update payload must include id, pinboard_id, type, plus fields
const updateLinkSchema = z.object({
  type: z.literal("link"),
  id: uuidSchema,
  pinboard_id: uuidSchema,
  title: z.string().min(1).max(120).optional(),
  url: z.string().min(1).max(2048).optional(),
  description: z.string().max(500).optional().nullable(),
});

const updateNoteSchema = z.object({
  type: z.literal("note"),
  id: uuidSchema,
  pinboard_id: uuidSchema,
  title: z.string().min(1).max(120).optional().nullable(),
  body: z.string().max(10000).optional(), // client might send body
  body_markdown: z.string().max(10000).optional(), // or body_markdown
});

const updateEventSchema = z.object({
  type: z.literal("event"),
  id: uuidSchema,
  pinboard_id: uuidSchema,
  title: z.string().min(1).max(120).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
});

const updatePinSchema = z.discriminatedUnion("type", [
  updateLinkSchema,
  updateNoteSchema,
  updateEventSchema,
]);

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    const body = await readBody(req);

    // Allow legacy field names from older forms
    if (body.boardId && !body.pinboard_id) body.pinboard_id = body.boardId;
    if (body.event_date && !body.date) body.date = body.event_date;
    if (body.content && !body.body && !body.body_markdown) body.body = body.content;

    const parsed = updatePinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const v = parsed.data;

    // Build patch per type (and only include provided fields)
    let tableName: "link_pins" | "note_pins" | "event_pins";
    const patch: Record<string, any> = {};

    if (v.type === "link") {
      tableName = "link_pins";

      if (typeof v.title === "string") patch.title = v.title.trim();
      if (typeof v.url === "string") patch.url = normalizeUrl(v.url);
      if (v.description !== undefined) {
        const d = v.description;
        patch.description = d === null ? null : String(d).trim() || null;
      }
    } else if (v.type === "note") {
      tableName = "note_pins";

      if (v.title !== undefined) patch.title = v.title === null ? null : String(v.title).trim();
      const bodyText =
        (typeof v.body_markdown === "string" ? v.body_markdown : undefined) ??
        (typeof v.body === "string" ? v.body : undefined);

      if (typeof bodyText === "string") patch.body_markdown = bodyText;
    } else {
      tableName = "event_pins";

      if (typeof v.title === "string") patch.title = v.title.trim();
      if (typeof v.date === "string") patch.date = v.date;
      if (v.time !== undefined) patch.time = v.time === null ? null : String(v.time).trim() || null;
      if (v.location !== undefined)
        patch.location = v.location === null ? null : String(v.location).trim() || null;
      if (v.description !== undefined)
        patch.description = v.description === null ? null : String(v.description).trim() || null;
    }

    // Don’t allow empty updates
    // (prevents “Save” nuking fields when nothing changed)
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase
      .from(tableName)
      .update(patch)
      .eq("id", v.id)
      .eq("pinboard_id", v.pinboard_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Form post: bounce back to editor
    if (!contentType.includes("application/json")) {
      const back = req.headers.get("referer") || `/app/pinboards/${v.pinboard_id}/edit`;
      return NextResponse.redirect(back, { status: 303 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in POST /api/pins/update:", err);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
