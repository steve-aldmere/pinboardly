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
  subscription_status: string | null;
  trial_ends_at: string | null; // ISO string from Supabase
};

function isOrgActive(org: Org) {
  if (org.subscription_status === "active") return true;
  if (!org.trial_ends_at) return false;
  const trialEnds = new Date(org.trial_ends_at).getTime();
  return Number.isFinite(trialEnds) && Date.now() < trialEnds;
}

export async function getOrgBySlug(slug: string): Promise<{
  org: Org | null;
  isActive: boolean;
}> {
  const supabase = await createServerSupabaseClient();

  const { data: org, error } = await supabase
    .from("orgs")
    .select(
      "id,slug,name,description,logo_url,primary_color,accent_color,subscription_status,trial_ends_at"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !org) return { org: null, isActive: false };

  return { org, isActive: isOrgActive(org) };
}
