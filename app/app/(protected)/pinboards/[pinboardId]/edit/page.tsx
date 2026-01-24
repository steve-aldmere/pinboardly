import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import LinkManager from "./LinkManager";
import NoteManager from "./NoteManager";
import EventManager from "./EventManager";
import PinboardSettings from "./PinboardSettings";

export default async function EditPinboardPage({
  params,
}: {
  params: Promise<{ pinboardId: string }>;
}) {
  const { pinboardId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/app/login");
  }

  const { data: pinboard, error: pinboardError } = await supabase
    .from("pinboards")
    .select("*")
    .eq("id", pinboardId)
    .eq("owner_user_id", userData.user.id)
    .single();

  if (pinboardError) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-6">
        <p>Something went wrong loading this pinboard.</p>
      </div>
    );
  }

  if (!pinboard) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-6">
        <p>Pinboard not found.</p>
      </div>
    );
  }

  // Fetch links
  const { data: links, error: linksError } = await supabase
    .from("link_pins")
    .select("*")
    .eq("pinboard_id", pinboardId)
    .order("sort_order", { ascending: true });

  // Fetch notes
  const { data: notes, error: notesError } = await supabase
    .from("note_pins")
    .select("*")
    .eq("pinboard_id", pinboardId)
    .order("sort_order", { ascending: true });

  // Fetch events
  const { data: events, error: eventsError } = await supabase
    .from("event_pins")
    .select("*")
    .eq("pinboard_id", pinboardId)
    .order("date", { ascending: true });

  if (linksError || notesError || eventsError) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-6">
        <p>Something went wrong loading this pinboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href="/app/dashboard"
            className="text-sm text-primary hover:text-primary"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">{pinboard.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              pinboardly.com/{pinboard.slug}
            </p>
          </div>
          <Link
            href={`/${pinboard.slug}`}
            target="_blank"
            className="text-sm text-primary hover:text-primary"
          >
            View public page →
          </Link>
        </div>

        <PinboardSettings
          pinboardId={pinboardId}
          initialTitle={pinboard.title}
          status={pinboard.status}
          trialEndsAt={pinboard.trial_ends_at}
          paidUntil={pinboard.paid_until}
        />

        <div className="space-y-10">
          <NoteManager pinboardId={pinboardId} initialNotes={notes ?? []} />

          <LinkManager pinboardId={pinboardId} initialLinks={links ?? []} />

          <EventManager pinboardId={pinboardId} initialEvents={events ?? []} />
        </div>
      </div>
    </div>
  );
}
