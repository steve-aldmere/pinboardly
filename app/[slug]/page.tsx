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
  "icon.png",
  "apple-icon.png",
]);

export default async function OrgBySlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  if (!slug || RESERVED.has(slug)) notFound();

  const supabase = await createServerSupabaseClient();

  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .select("slug,name,description,logo_url,primary_color,accent_color,is_public")
    .eq("slug", slug)
    .maybeSingle();

  if (orgErr) {
    // TEMP: show the real reason instead of a silent 404
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Error loading organisation</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-lg border bg-white p-4 text-sm">
          {orgErr.message}
        </pre>
      </div>
    );
  }

  if (!org) notFound();

  const { data: boards, error: boardsErr } = await supabase
    .from("boards")
    .select("id,title,description,board_type,is_public,slug,created_at,org_slug")
    .eq("org_slug", slug)
    .order("created_at", { ascending: true });

  if (boardsErr) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Error loading boards</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-lg border bg-white p-4 text-sm">
          {boardsErr.message}
        </pre>
      </div>
    );
  }

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
      org={org as any}
      boards={(boards ?? []) as any}
      isLoggedIn={!!user}
      isOrgAdmin={isOrgAdmin}
    />
  );
}
