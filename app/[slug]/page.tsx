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

function SectionCard({
  title,
  href,
  hasItems,
  children,
  emptyTitle,
  emptyBody,
}: {
  title: string;
  href: string;
  hasItems: boolean;
  children: React.ReactNode;
  emptyTitle: string;
  emptyBody?: string;
}) {
  return (
    <section className="mb-10">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {hasItems ? (
            <Link href={href} className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          ) : null}
        </div>

        {hasItems ? (
          children
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-700">{emptyTitle}</p>
            {emptyBody ? <p className="text-xs text-gray-500 mt-1">{emptyBody}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Pinboard Unavailable</h1>
          <p className="text-gray-600 mb-6">
            This pinboard needs an active subscription to stay live.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-bold mb-6">{pinboard.title}</h1>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600">Could not load pinboard content.</p>
          </div>
        </div>
      </div>
    );
  }

  const { links, notes, events } = contentResult;

  const linksPreview = (links as LinkPin[]).slice(0, 5);
  const notesPreview = (notes as NotePin[]).slice(0, 5);
  const eventsPreview = (events as EventPin[]).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-8">{pinboard.title}</h1>

        <SectionCard
          title="Links"
          href={`/${slug}/links`}
          hasItems={linksPreview.length > 0}
          emptyTitle="No links yet."
          emptyBody="Add your first link to share useful resources."
        >
          <div className="space-y-3">
            {linksPreview.map((l) => (
              <div key={l.id} className="rounded-lg border border-gray-200 p-4">
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  {l.title}
                </a>
                {l.description ? (
                  <p className="text-sm text-gray-600 mt-1">{l.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Notes"
          href={`/${slug}/notes`}
          hasItems={notesPreview.length > 0}
          emptyTitle="No notes yet."
          emptyBody="Notes are great for updates, instructions, and key info."
        >
          <NotesOverviewClient notes={notesPreview} slug={slug} />
        </SectionCard>

        <SectionCard
          title="Events"
          href={`/${slug}/events`}
          hasItems={eventsPreview.length > 0}
          emptyTitle="No events yet."
          emptyBody="Add dates and reminders so people know what’s coming up."
        >
          <div className="space-y-3">
            {eventsPreview.map((e) => (
              <div key={e.id} className="rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-blue-600 font-medium">
                  {formatEventDate(e.date, e.time)}
                </div>
                <div className="font-semibold mt-1">{e.title}</div>
                {e.location ? (
                  <div className="text-sm text-gray-600 mt-1">📍 {e.location}</div>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
