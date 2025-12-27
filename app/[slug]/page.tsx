// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import OrgPageClient from "@/app/orgs/[slug]/OrgPageClient";

const RESERVED = new Set([
  "api",
  "boards",
  "orgs",
  "login",
  "invite",
  "notes",
  "b",
  "_next",
  "favicon.ico",
]);

export default async function OrgBySlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  if (!slug || RESERVED.has(slug)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();

  // Optional auth
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  // Load org (RLS controls public/private)
  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .select("slug,name,description,logo_url,primary_color,accent_color,is_public")
    .eq("slug", slug)
    .maybeSingle();

  if (orgErr || !org) {
    notFound();
  }

  // Load boards for org (RLS enforces visibility)
  const { data: boards, error: boardsErr } = await supabase
    .from("boards")
    .select("id,title,description,board_type,is_public,slug,created_at,org_slug")
    .eq("org_slug", slug)
    .order("created_at", { ascending: true });

  if (boardsErr) {
    throw new Error(boardsErr.message);
  }

  // Determine role (only if logged in)
  let isOrgAdmin = false;

  if (user) {
    const { data: memberRow } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_slug", slug)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberRow?.role === "admin") {
      isOrgAdmin = true;
    }
  }

  return (
    <OrgPageClient
      org={org}
      boards={boards ?? []}
      isLoggedIn={!!user}
      isOrgAdmin={isOrgAdmin}
    />
  );
}
