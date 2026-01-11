import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPinboard } from "@/lib/pinboard-public";
import { getPublicPinboardContent } from "@/lib/pinboard-public-content";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import NotesOverviewClient from "./NotesOverviewClient";

export default async function PinboardPage({
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

  const contentResult = await getPublicPinboardContent(result.pinboard.id);

  if (!contentResult.ok) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-bold mb-2">{result.pinboard.title}</h1>
          <p className="text-gray-600">Could not load pinboard content.</p>
        </div>
      </div>
    );
  }

  const { links, notes, events } = contentResult;

  const formatEventDate = (dateString: string, timeString: string | null) => {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (timeString) {
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

    return formatted;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-8">{result.pinboard.title}</h1>

        {/* LINKS */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Links</h2>

          {links.length > 0 ? (
            <div className="space-y-5">
              {links.map((link) => (
                <div key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    {link.title}
                  </a>
                  {link.description ? (
                    <p className="text-gray-600 text-sm mt-1">{link.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No links yet.</p>
          )}
        </section>

        {/* NOTES (client component = modal + click) */}
        <div className="mb-10">
          <NotesOverviewClient notes={notes} slug={slug} />
        </div>

        {/* EVENTS */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Events</h2>

          {events.length > 0 ? (
            <div className="space-y-8">
              {events.map((event) => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium mb-2">
                    {formatEventDate(event.date, event.time)}
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>

                  {event.location ? (
                    <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
                  ) : null}

                  {event.description ? (
                    <div className="prose max-w-none">
                      <MarkdownRenderer content={event.description} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No events yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
