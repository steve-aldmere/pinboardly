import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPinboard } from "@/lib/pinboard-public";
import { getPublicPinboardContent } from "@/lib/pinboard-public-content";
import NotesOverviewClient from "./NotesOverviewClient";

type LinkPin = {
  id: string;
  title: string;
  url: string;
  description: string | null;
};

type NotePin = {
  id: string;
  title: string | null;
  body_markdown: string;
};

type EventPin = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:mm or null
  location: string | null;
  description: string | null;
};

function formatEventDate(dateString: string, timeString: string | null) {
  const date = new Date(dateString);

  const formatted = date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!timeString) return formatted;

  const [hours, minutes] = timeString.split(":");
  const timeDate = new Date();
  timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

  const timeFormatted = timeDate.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formatted} at ${timeFormatted}`;
}

export default async function PinboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await getPublicPinboard(slug);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();

    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Pinboard Unavailable</h1>
          <p className="text-muted-foreground mb-6">
            This pinboard needs an active subscription to stay live.
          </p>
          <Link href="/" className="text-primary hover:text-primary">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const pinboard = result.pinboard;

  const contentResult = await getPublicPinboardContent(pinboard.id);

  if (!contentResult.ok) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-bold mb-6">{pinboard.title}</h1>
          <div className="bg-white border border-border rounded-lg p-6">
            <p className="text-muted-foreground">Could not load pinboard content.</p>
          </div>
        </div>
      </div>
    );
  }

  const { links, notes, events } = contentResult;

  const linksPreview = (links as LinkPin[]).slice(0, 5);
  const notesPreview = (notes as NotePin[]).slice(0, 5);
  const eventsPreview = (events as EventPin[]).slice(0, 5);

  const isDemo = slug === "demo-board";

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {isDemo ? (
          <div className="mb-8 rounded-xl border border-border bg-white p-5">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Demo pinboard:</span> This is an
              example of a pinboard. Everything you can see is editable,
              including the title and the content in each Note, Link and Event.
            </p>
            <div className="mt-3">
              <Link
                href="/app/pinboards/new"
                className="text-sm font-medium text-primary hover:text-primary"
              >
                Create your own pinboard →
              </Link>
            </div>
          </div>
        ) : null}

        <h1 className="text-4xl font-bold mb-8">{pinboard.title}</h1>

        {/* Notes */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Notes</h2>
            <Link
              href={`/${slug}/notes`}
              className="text-sm text-primary hover:text-primary"
            >
              View all →
            </Link>
          </div>

          {notesPreview.length > 0 ? (
            <NotesOverviewClient notes={notesPreview} slug={slug} />
          ) : (
            <div className="bg-white border border-border rounded-lg p-6">
              <p className="text-muted-foreground">No notes yet.</p>
            </div>
          )}
        </section>

        {/* Links */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Links</h2>
            <Link
              href={`/${slug}/links`}
              className="text-sm text-primary hover:text-primary"
            >
              View all →
            </Link>
          </div>

          {linksPreview.length > 0 ? (
            <div className="space-y-3">
              {linksPreview.map((l) => (
                <div
                  key={l.id}
                  className="bg-white border border-border rounded-lg p-4"
                >
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary underline font-medium"
                  >
                    {l.title}
                  </a>
                  {l.description ? (
                    <p className="text-sm text-muted-foreground mt-1">{l.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg p-6">
              <p className="text-muted-foreground">No links yet.</p>
            </div>
          )}
        </section>

        {/* Events */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Events</h2>
            <Link
              href={`/${slug}/events`}
              className="text-sm text-primary hover:text-primary"
            >
              View all →
            </Link>
          </div>

          {eventsPreview.length > 0 ? (
            <div className="space-y-3">
              {eventsPreview.map((e) => (
                <div
                  key={e.id}
                  className="bg-white border border-border rounded-lg p-4"
                >
                  <div className="text-sm text-primary font-medium">
                    {formatEventDate(e.date, e.time)}
                  </div>
                  <div className="font-semibold mt-1">{e.title}</div>
                  {e.location ? (
                    <div className="text-sm text-muted-foreground mt-1">
                      📍 {e.location}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg p-6">
              <p className="text-muted-foreground">No events yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
