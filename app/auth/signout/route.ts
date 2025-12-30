// app/auth/signout/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function doSignOut(req: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  // Send them somewhere that definitely exists
  return NextResponse.redirect(new URL("/orgs", req.url), { status: 302 });
}

export async function GET(req: Request) {
  return doSignOut(req);
}

export async function POST(req: Request) {
  return doSignOut(req);
}
