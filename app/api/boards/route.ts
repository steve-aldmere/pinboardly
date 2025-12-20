import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await req.formData();

  const org_slug = String(form.get("org_slug") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const descriptionRaw = form.get("description");
  const description =
    descriptionRaw === null ? null : String(descriptionRaw).trim() || null;

  const board_type = String(form.get("board_type") ?? "notes").trim();
  const is_public = form.get("is_public") === "on";

  if (!org_slug || !title) {
    return NextResponse.json(
      { error: "Missing org_slug or title" },
      { status: 400 }
    );
  }

  // Generate a unique-ish slug (and avoid duplicate constraint issues)
  const base = slugify(title) || "board";
  const suffix = Math.random().toString(36).slice(2, 7);
  const slug = `${base}-${suffix}`;

  const { error: insertErr } = await supabase.from("boards").insert({
    org_slug,
    title,
    description,
    board_type,
    is_public,
    slug,
    created_by: userData.user.id,
  });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 400 });
  }

  // Send them back to the org page
  return NextResponse.redirect(new URL(`/${org_slug}`, req.url), 303);
}
