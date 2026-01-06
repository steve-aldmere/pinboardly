// app/lib/pinboardAccess.ts
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type PinboardAccess = {
  orgSlug: string;
  isActive: boolean;
  ownerId: string | null;
  isOwner: boolean;
  isExempt: boolean;
  accountStatus: string | null;
};

function computeIsActive(org: {
  subscription_status?: string | null;
  trial_ends_at?: string | null;
}) {
  if ((org.subscription_status || "").toLowerCase() === "active") return true;

  if (org.trial_ends_at) {
    const t = new Date(org.trial_ends_at).getTime();
    if (Number.isFinite(t) && Date.now() < t) return true;
  }

  return false;
}

export async function getPinboardAccessBySlug(slug: string): Promise<{
  org: any | null;
  access: PinboardAccess;
}> {
  const supabase = await createServerSupabaseClient();

  // Load org (pinboard)
  const { data: org, error: orgErr } = await supabase
    .from("orgs")
    .select("slug,name,description,logo_url,is_public,subscription_status,trial_ends_at")
    .eq("slug", slug)
    .maybeSingle();

  const base: PinboardAccess = {
    orgSlug: slug,
    isActive: false,
    ownerId: null,
    isOwner: false,
    isExempt: false,
    accountStatus: null,
  };

  if (orgErr || !org) {
    return { org: null, access: base };
  }

  // Determine owner as: earliest board created_by for this org
  const { data: ownerBoard } = await supabase
    .from("boards")
    .select("created_by, created_at")
    .eq("org_slug", slug)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const ownerId = ownerBoard?.created_by ?? null;

  // Current viewer
  const { data: userData } = await supabase.auth.getUser();
  const viewerId = userData?.user?.id ?? null;

  // "Exempt" logic:
  // If you have a profiles table, we’ll try to read it.
  // If you don’t, or RLS blocks it, we fall back to not-exempt.
  let isExempt = false;
  let accountStatus: string | null = null;

  if (ownerId) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("account_status,is_exempt")
      .eq("user_id", ownerId)
      .maybeSingle();

    isExempt = !!profileRow?.is_exempt;
    accountStatus = (profileRow?.account_status as string | null) ?? null;
  }

  const isActive = isExempt ? true : computeIsActive(org);
  const isOwner = !!viewerId && !!ownerId && viewerId === ownerId;

  return {
    org,
    access: {
      orgSlug: slug,
      isActive,
      ownerId,
      isOwner,
      isExempt,
      accountStatus,
    },
  };
}
