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
  "b",
  "_next",
  "favicon.ico",
]);

export default async function OrgBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug || RESERVED.has(slug)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();

  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .select("slug,name,description,logo_url,primary_color,accent_color,is_public,created_at")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (orgErr || !org) {
    notFound();
  }

  const { data: boards } = await supabase
    .from("boards")
    .select("id,title,description,board_type,is_public,slug,created_at,org_slug")
    .eq("org_slug", slug)
    .order("created_at", { ascending: true });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  let isOrgAdmin = false;

  if (user) {
    const { data: member } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_slug", slug)
      .eq("user_id", user.id)
      .maybeSingle();

    isOrgAdmin = member?.role === "admin";
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
