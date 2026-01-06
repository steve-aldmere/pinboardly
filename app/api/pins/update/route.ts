import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function normalizeUrl(input: string) {
  const s = (input || "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";

  let id = "";
  let title = "";
  let content = "";
  let urlVal = "";
  let eventDateVal = "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    id = asString(body.id).trim();
    title = asString(body.title).trim();
    content = asString(body.content).trim();
    urlVal = asString(body.url).trim();
    eventDateVal = asString(body.event_date).trim();
  } else {
    const form = await req.formData();
    id = asString(form.get("id")).trim();
    title = asString(form.get("title")).trim();
    content = asString(form.get("content")).trim();
    urlVal = asString(form.get("url")).trim();
    eventDateVal = asString(form.get("event_date")).trim();
  }

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  urlVal = urlVal ? normalizeUrl(urlVal) : "";

  // Only update fields that were actually provided (so empty form fields don’t nuke data accidentally)
  const patch: any = {};

  if (title !== "") patch.title = title;
  if (content !== "") patch.content = content;
  if (urlVal !== "") patch.url = urlVal;
  if (eventDateVal !== "") patch.event_date = eventDateVal;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("pins").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!contentType.includes("application/json")) {
    const back = req.headers.get("referer") || "/orgs";
    return NextResponse.redirect(back, { status: 303 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
