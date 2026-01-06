import { getPublicPinboard } from "@/lib/pinboard-public";
import { getPublicPinboardContent } from "@/lib/pinboard-public-content";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

export default async function PinboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicPinboard(slug);

  if (!result.ok) {
    const message = result.reason === "not_found" 
      ? "Pinboard not found"
      : "This pinboard is not active";
    
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <p>{message}</p>
      </div>
    );
  }

  const contentResult = await getPublicPinboardContent(result.pinboard.id);

  if (!contentResult.ok) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          {result.pinboard.title}
        </h1>
        <p>Could not load pinboard content</p>
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
    <div style={{ padding: "2.5rem 2rem", fontFamily: "system-ui, sans-serif", maxWidth: "880px", margin: "0 auto", lineHeight: "1.6" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2.5rem", lineHeight: "1.2" }}>
        {result.pinboard.title}
      </h1>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.25rem" }}>Links</h2>
        {links.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {links.map((link) => (
              <div key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0066cc", textDecoration: "underline", display: "block", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: "500" }}
                >
                  {link.title}
                </a>
                {link.description && (
                  <p style={{ color: "#555", fontSize: "0.9375rem", marginTop: "0.375rem", lineHeight: "1.5" }}>
                    {link.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#666", fontSize: "0.9375rem" }}>No links yet.</p>
        )}
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.25rem" }}>Notes</h2>
        {notes.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {notes.map((note) => (
              <div key={note.id}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.75rem", lineHeight: "1.3" }}>
                  {note.title || "Untitled"}
                </h3>
                <MarkdownRenderer content={note.body_markdown} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#666", fontSize: "0.9375rem" }}>No notes yet.</p>
        )}
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.25rem" }}>Events</h2>
        {events.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {events.map((event) => (
              <div key={event.id}>
                <div style={{ fontSize: "0.9375rem", color: "#0066cc", marginBottom: "0.5rem", fontWeight: "500" }}>
                  {formatEventDate(event.date, event.time)}
                </div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", lineHeight: "1.3" }}>
                  {event.title}
                </h3>
                {event.location && (
                  <p style={{ color: "#555", fontSize: "0.9375rem", marginBottom: "0.5rem", lineHeight: "1.5" }}>
                    📍 {event.location}
                  </p>
                )}
                {event.description && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <MarkdownRenderer content={event.description} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#666", fontSize: "0.9375rem" }}>No events yet.</p>
        )}
      </section>
    </div>
  );
}
