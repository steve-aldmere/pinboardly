import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicPinboard } from "@/lib/pinboard-public";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type EventPin = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  description: string | null;
};

export default async function EventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await getPublicPinboard(slug);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();

    // inactive
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Pinboard Unavailable</h1>
          <p className="text-muted-foreground mb-6">
            This pinboard needs an active subscription to stay live.
          </p>
          <Link href={`/${slug}`} className="text-primary hover:text-primary">
            ← Back to overview
          </Link>
        </div>
      </div>
    );
  }

  const pinboard = result.pinboard;

  const supabase = await createServerSupabaseClient();

  // Fetch events (max 100)
  const { data: events } = await supabase
    .from("event_pins")
    .select("*")
    .eq("pinboard_id", pinboard.id)
    .order("date", { ascending: true })
    .limit(100);

  // Format date for events
  const formatEventDate = (dateString: string, timeString: string | null) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    let formatted = date.toLocaleDateString(undefined, options);

    if (timeString) {
      const [hours, minutes] = timeString.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      const teFormatted = timeDate.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      formatted += ` at ${teFormatted}`;
    }

    return formatted;
  };

  // Sort events: future first, then past
  const sortedEvents = (events || []).sort((a, b) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const dateA = new Date(a.date);
    dateA.setHours(0, 0, 0, 0);
    const dateB = new Date(b.date);
    dateB.setHours(0, 0, 0, 0);

    const aIsFuture = dateA >= now;
    const bIsFuture = dateB >= now;

    // Future events come first
    if (aIsFuture && !bIsFuture) return -1;
    if (!aIsFuture && bIsFuture) return 1;

    // If both future or both past, sort by date
    const dateAWithTime = new Date(a.date + (a.time ? `T${a.time}` : ""));
    const dateBWithTime = new Date(b.date + (b.time ? `T${b.time}` : ""));

    if (aIsFuture) {
      // Future: ascending (soonest first)
      return dateAWithTime.getTime() - dateBWithTime.getTime();
    } else {
      // Past: descending (most recent first)
      return dateBWithTime.getTime() - dateAWithTime.getTime();
    }
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href={`/${slug}`} className="text-sm text-primary hover:text-primary">
            ← Back to overview
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">{pinboard.title}</h1>
        <h2 className="text-2xl font-semibold text-muted-foreground mb-8">Events</h2>

        {!sortedEvents || sortedEvents.length === 0 ? (
          <div className="bg-muted border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No events yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              This pinboard doesn't have any events.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event: EventPin) => {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const isPast = eventDate < now;

              return (
                <div
                  key={event.id}
                  className={`bg-white border rounded-lg p-4 ${
                    isPast ? "border-border opacity-75" : "border-border"
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isPast ? "text-muted-foreground" : "text-primary"}`}>
                    {formatEventDate(event.date, event.time)}
                  </div>
                  <h3 className="font-medium text-lg">{event.title}</h3>
                  {event.location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      📍 {event.location}
                    </p>
                  )}
                  {event.description && (
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap break-words">
                      {event.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
