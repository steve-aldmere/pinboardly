import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function getPublicPinboardContent(pinboardId: string) {
  const supabase = await createServerSupabaseClient();

  const [linksResult, notesResult, eventsResult] = await Promise.all([
    supabase
      .from("link_pins")
      .select("id, title, url, description, sort_order")
      .eq("pinboard_id", pinboardId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("note_pins")
      .select("id, title, body_markdown, sort_order")
      .eq("pinboard_id", pinboardId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("event_pins")
      .select("id, title, date, time, location, description")
      .eq("pinboard_id", pinboardId)
      .order("date", { ascending: true })
      .order("time", { ascending: true }),
  ]);

  if (linksResult.error || notesResult.error || eventsResult.error) {
    return { ok: false as const, reason: "content_error" };
  }

  return {
    ok: true as const,
    links: linksResult.data ?? [],
    notes: notesResult.data ?? [],
    events: eventsResult.data ?? [],
  };
}
