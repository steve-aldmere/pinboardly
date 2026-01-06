"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function normalizeTimeForDb(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  if (!v) return null;

  // Accept HH:MM and HH:MM:SS
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return `${v}:00`;
  if (/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(v)) return v;

  return null;
}

// Add Link
export async function addLinkAction(formData: FormData) {
  const pinboardId = String(formData.get("pinboardId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!title || !url) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Invalid link data`);
  }

  const supabase = await createServerSupabaseClient();

  // Get current max sort_order
  const { data: existingLinks } = await supabase
    .from("link_pins")
    .select("sort_order")
    .eq("pinboard_id", pinboardId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingLinks?.[0]?.sort_order ?? 0;

  const { error } = await supabase.from("link_pins").insert({
    pinboard_id: pinboardId,
    title,
    url,
    description,
    sort_order: nextSortOrder + 1,
  });

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}

// Delete Link
export async function deleteLinkAction(formData: FormData) {
  const linkId = String(formData.get("linkId") ?? "");
  const pinboardId = String(formData.get("pinboardId") ?? "");

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("link_pins")
    .delete()
    .eq("id", linkId);

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}

// Update Link (for future editing)
export async function updateLinkAction(formData: FormData) {
  const linkId = String(formData.get("linkId") ?? "");
  const pinboardId = String(formData.get("pinboardId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("link_pins")
    .update({ title, url, description })
    .eq("id", linkId);

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}

// Add Note
export async function addNoteAction(formData: FormData) {
  const pinboardId = String(formData.get("pinboardId") ?? "");
  const title = String(formData.get("title") ?? "").trim() || null;
  const body_markdown = String(formData.get("body_markdown") ?? "").trim();

  if (!body_markdown) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Note content is required`);
  }

  const supabase = await createServerSupabaseClient();

  const { data: existingNotes } = await supabase
    .from("note_pins")
    .select("sort_order")
    .eq("pinboard_id", pinboardId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingNotes?.[0]?.sort_order ?? 0;

  const { error } = await supabase.from("note_pins").insert({
    pinboard_id: pinboardId,
    title,
    body_markdown,
    sort_order: nextSortOrder + 1,
  });

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}

// Delete Note
export async function deleteNoteAction(formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "");
  const pinboardId = String(formData.get("pinboardId") ?? "");

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("note_pins")
    .delete()
    .eq("id", noteId);

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}

// Update Note
export async function updateNoteAction(formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "");
  const pinboardId = String(formData.get("pinboardId") ?? "");
  const title = String(formData.get("title") ?? "").trim() || null;
  const body_markdown = String(formData.get("body_markdown") ?? "").trim();

  if (!body_markdown) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Note content is required`);
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("note_pins")
    .update({ title, body_markdown })
    .eq("id", noteId);

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}

// Add Event
export async function addEventAction(formData: FormData) {
  const pinboardId = String(formData.get("pinboardId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = normalizeTimeForDb(formData.get("time"));
  const location = String(formData.get("location") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!title || !date) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Event title and date are required`);
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("event_pins").insert({
    pinboard_id: pinboardId,
    title,
    date,
    time,
    location,
    description,
  });

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}


// Delete Event
export async function deleteEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const pinboardId = String(formData.get("pinboardId") ?? "");

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("event_pins")
    .delete()
    .eq("id", eventId);

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}

// Update Event
export async function updateEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const pinboardId = String(formData.get("pinboardId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = normalizeTimeForDb(formData.get("time"));
  const location = String(formData.get("location") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!title || !date) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Event title and date are required`);
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("event_pins")
    .update({ title, date, time, location, description })
    .eq("id", eventId);

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit`);
}


// Reorder Links
export async function reorderLinksAction(pinboardId: string, orderedLinkIds: string[]) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // Verify ownership
  const { data: pinboard } = await supabase
    .from("pinboards")
    .select("id")
    .eq("id", pinboardId)
    .eq("owner_user_id", user.id)
    .single();

  if (!pinboard) {
    return { ok: false, error: "Pinboard not found" };
  }

  // Update sort_order for each link using Promise.all
  const updatePromises = orderedLinkIds.map((linkId, index) =>
    supabase
      .from("link_pins")
      .update({ sort_order: index + 1 })
      .eq("id", linkId)
      .eq("pinboard_id", pinboardId)
  );

  const results = await Promise.all(updatePromises);
  const error = results.find((result) => result.error)?.error;

  if (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// Reorder Notes
export async function reorderNotesAction(pinboardId: string, orderedNoteIds: string[]) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  // Verify ownership
  const { data: pinboard } = await supabase
    .from("pinboards")
    .select("id")
    .eq("id", pinboardId)
    .eq("owner_user_id", user.id)
    .single();

  if (!pinboard) {
    return { ok: false, error: "Pinboard not found" };
  }

  // Update sort_order for each note using Promise.all
  const updatePromises = orderedNoteIds.map((noteId, index) =>
    supabase
      .from("note_pins")
      .update({ sort_order: index + 1 })
      .eq("id", noteId)
      .eq("pinboard_id", pinboardId)
  );

  const results = await Promise.all(updatePromises);
  const error = results.find((result) => result.error)?.error;

  if (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  return { ok: true };
}

// Update Pinboard Title
export async function updatePinboardTitleAction(formData: FormData) {
  const pinboardId = String(formData.get("pinboardId") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Title is required`);
  }

  if (title.length > 80) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Title must be 80 characters or less`);
  }

  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Not authenticated`);
  }

  // Verify ownership
  const { data: pinboard } = await supabase
    .from("pinboards")
    .select("id")
    .eq("id", pinboardId)
    .eq("owner_user_id", userData.user.id)
    .single();

  if (!pinboard) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=Pinboard not found`);
  }

  const { error } = await supabase
    .from("pinboards")
    .update({ title })
    .eq("id", pinboardId);

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/app/pinboards/${pinboardId}/edit`);
  redirect(`/app/pinboards/${pinboardId}/edit?success=Title updated`);
}

// Remove Pinboard
export async function removePinboardAction(formData: FormData) {
  const pinboardId = String(formData.get("pinboardId") ?? "");

  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/dashboard?error=Not authenticated");
  }

  // Verify ownership and get current status
  const { data: pinboard } = await supabase
    .from("pinboards")
    .select("id, status")
    .eq("id", pinboardId)
    .eq("owner_user_id", userData.user.id)
    .single();

  if (!pinboard) {
    redirect("/app/dashboard?error=Pinboard not found");
  }

  // Calculate restore_until date (30 days from now)
  const restoreUntil = new Date();
  restoreUntil.setDate(restoreUntil.getDate() + 30);

  const { error } = await supabase
    .from("pinboards")
    .update({
      status: "removed",
      removed_at: new Date().toISOString(),
      restore_until: restoreUntil.toISOString(),
    })
    .eq("id", pinboardId);

  if (error) {
    redirect(`/app/pinboards/${pinboardId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/dashboard");
  redirect("/app/dashboard?success=Pinboard removed");
}

// Restore Pinboard
export async function restorePinboardAction(formData: FormData) {
  const pinboardId = String(formData.get("pinboardId") ?? "");

  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/dashboard?error=Not authenticated");
  }

  // Verify ownership
  const { data: pinboard } = await supabase
    .from("pinboards")
    .select("id, status")
    .eq("id", pinboardId)
    .eq("owner_user_id", userData.user.id)
    .single();

  if (!pinboard || pinboard.status !== "removed") {
    redirect("/app/dashboard?error=Pinboard not found or not removed");
  }

  // Restore to 'trial' status by default
  // In a production system, you might store previous_status when removing
  const previousStatus = "trial";

  const { error } = await supabase
    .from("pinboards")
    .update({
      status: previousStatus,
      removed_at: null,
      restore_until: null,
    })
    .eq("id", pinboardId);

  if (error) {
    redirect(`/app/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/dashboard");
  redirect("/app/dashboard?success=Pinboard restored");
}