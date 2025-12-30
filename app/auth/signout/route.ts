// app/auth/signout/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();

  // Clear Supabase session cookies
  await supabase.auth.signOut();

  // Go back to homepage (or /orgs if you prefer)
  return NextResponse.redirect(new URL("/", req.url), { status: 302 });
}
