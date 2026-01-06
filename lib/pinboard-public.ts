import { createServerSupabaseClient } from "./supabase-server";

export async function getPublicPinboard(slug: string) {
  const supabase = await createServerSupabaseClient();

  const { data: pinboard, error } = await supabase
    .from("pinboards")
    .select("id, slug, title, status")
    .eq("slug", slug)
    .single();

  if (error || !pinboard) {
    return { ok: false as const, reason: "not_found" };
  }

  if (pinboard.status !== "trial" && pinboard.status !== "active") {
    return { ok: false as const, reason: "inactive" };
  }

  return { ok: true as const, pinboard };
}

