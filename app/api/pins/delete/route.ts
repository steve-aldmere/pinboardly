// app/api/pins/delete/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { badRequest } from "@/lib/api/respond";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }

  const form = await req.formData().catch(() => null);
  const id = (form?.get("id") ?? "").toString();

  if (!id) {
    return badRequest("Missing id");
  }

  const { error } = await supabase.from("pins").delete().eq("id", id);

  if (error) {
    return badRequest(error.message);
  }

  const referer = req.headers.get("referer") || "/";
  return NextResponse.redirect(referer, { status: 303 });
}
