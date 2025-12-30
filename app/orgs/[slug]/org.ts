// app/orgs/[slug]/org.ts
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type Org = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;

  // These may not exist yet in your DB, so keep them optional
  subscription_status?: string | null;
  trial_ends_at?: string | null;

  // Legacy fields you already have
  is_public?: boolean | null;
};

function computeIsActive(org: Org) {
  // If you have subscription_status, use it
  if (org.subscription_status === "active") return true;

  // If you have trial_ends_at, use it
  if (org.trial_ends_at) {
    const t = new Date(org.trial_ends_at).getTime();
    if (Number.isFinite(t) && Date.now() < t) return true;
  }

  // Temporary fallback while DB fields are being introduced:
  // treat org as active so pages render instead of 404.
  return true;
}

export async function getOrgBySlug(slug: string): Promise<{
  org: Org | null;
  isActive: boolean;
}> {
  const supabase = await createServerSupabaseClient();

  // IMPORTANT: select("*") so we do not error if some columns don't exist yet
  const { data: org, error } = await supabase
    .from("orgs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !org) return { org: null, isActive: false };

  return { org, isActive: computeIsActive(org as Org) };
}
