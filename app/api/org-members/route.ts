import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const org_slug = typeof body.org_slug === "string" ? body.org_slug.trim() : "";

  if (!org_slug) {
    return NextResponse.json({ error: "Missing org_slug" }, { status: 400 });
  }

  // Never allow this endpoint to mint admin.
  // Admin is set by org creation bootstrap or by existing admins via invites/admin tools.
  const role = "member";

  const { error } = await supabase.from("org_members").upsert(
    {
      org_slug,
      user_id: userData.user.id,
      role,
    },
    { onConflict: "org_slug,user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
