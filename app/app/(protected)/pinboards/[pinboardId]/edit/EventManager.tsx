"use client";
import { useState, useMemo } from "react";
import { addEventAction, updateEventAction, deleteEventAction } from "./actions";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  description: string | null;
};

function normalizeTimeForInput(value: string | null | undefined): string {
  if (!value) return "";
  // Postgres time often comes back HH:MM:SS. We only want HH:MM in the UI.
  return value.slice(0, 5);
}

function localDateYYYYMMDD(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Client-side: keep it forgiving while typing, strict on blur/submit
function cleanTimeInput(raw: string): string {
  // keep only digits and colon
  const s = raw.replace(/[^\d:]/g, "").slice(0, 5);
  // allow partial typing like "2", "21", "21:", "21:3"
  return s;
}

function isValidHHMM(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export default function EventManager({
  pinboardId,
  initialEvents,
}: {
  pinboardId: string;
  initialEvents: Event[];
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const future: Event[] = [];
    const past: Event[] = [];

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate >= now) future.push(event);
      else past.push(event);
    });

    future.sort((a, b) => {
      const dateA = new Date(a.date + (a.time ? `T${a.time}` : ""));
      const dateB = new Date(b.date + (b.time ? `T${b.time}` : ""));
      return dateA.getTime() - dateB.getTime();
    });

    past.sort((a, b) => {
      const dateA = new Date(a.date + (a.time ? `T${a.time}` : ""));
      const dateB = new Date(b.date + (b.time ? `T${b.time}` : ""));
      return dateB.getTime() - dateA.getTime();
    });

    return [...future, ...past];
  }, [events]);

  const formatDate = (dateString: string, timeString: string | null) => {
    const date = new Date(`${dateString}T00:00:00Z`);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    };

    let formatted = date.toLocaleDateString("en-GB", options);

    if (timeString) {
      const hhmm = timeString.slice(0, 5);
      const timeDate = new Date(`1970-01-01T${hhmm}:00Z`);
      const timeFormatted = timeDate.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      });
      formatted += ` at ${timeFormatted}`;
    }

    return formatted;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Events</h2>
          <p className="text-sm text-gray-500 mt-1">{events.length} / 100 events</p>
        </div>
        {events.length < 100 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Add Event
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-4">Add New Event</h3>

          <form
            action={addEventAction}
            className="space-y-4"
            onSubmit={(e) => {
              // tighten time on submit so we never send junk
              const form = e.currentTarget;
              const timeEl = form.elements.namedItem("time") as HTMLInputElement | null;
              if (timeEl) {
                const cleaned = cleanTimeInput(timeEl.value);
                if (cleaned !== "" && !isValidHHMM(cleaned)) {
                  e.preventDefault();
                  timeEl.focus();
                  timeEl.setCustomValidity("Enter time as HH:MM (e.g. 20:30)");
                  timeEl.reportValidity();
                  return;
                }
                timeEl.setCustomValidity("");
                timeEl.value = cleaned;
              }
            }}
          >
            <input type="hidden" name="pinboardId" value={pinboardId} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                required
                maxLength={80}
                placeholder="e.g., Monthly Meeting"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={localDateYYYYMMDD()}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time (optional)
                </label>

                {/* Safari-proof time input */}
                <input
                  type="text"
                  name="time"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="HH:MM"
                  defaultValue=""
                  onInput={(e) => {
                    e.currentTarget.value = cleanTimeInput(e.currentTarget.value);
                    e.currentTarget.setCustomValidity("");
                  }}
                  onBlur={(e) => {
                    const v = e.currentTarget.value.trim();
                    if (v === "") {
                      e.currentTarget.setCustomValidity("");
                      return;
                    }
                    if (!isValidHHMM(v)) {
                      e.currentTarget.setCustomValidity("Enter time as HH:MM (e.g. 20:30)");
                      e.currentTarget.reportValidity();
                    } else {
                      e.currentTarget.setCustomValidity("");
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1">Use 24-hour format, e.g. 20:30</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
              <input
                type="text"
                name="location"
                maxLength={120}
                placeholder="e.g., Scout Hall, Main Street"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                name="description"
                maxLength={2000}
                rows={4}
                placeholder="Event details..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 2,000 characters.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Add Event
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No events yet.</p>
          <p className="text-sm text-gray-500 mt-1">Add your first event to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((event) => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const isPast = eventDate < now;

            return (
              <div
                key={event.id}
                className={`bg-white border rounded-lg p-4 ${
                  isPast ? "border-gray-200 opacity-75" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`text-sm font-medium ${isPast ? "text-gray-500" : "text-blue-600"}`}>
                        {formatDate(event.date, event.time)}
                      </div>
                    </div>
                    <h3 className="font-medium mt-1">{event.title}</h3>
                    {event.location && (
                      <p className="text-sm text-gray-600 mt-1">📍 {event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap break-words">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {editingId === event.id ? (
                    <div className="flex-shrink-0 ml-4">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <button
                        type="button"
                        onClick={() => setEditingId(event.id)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>

                      <form action={deleteEventAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="pinboardId" value={pinboardId} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            if (!confirm("Remove this event? This cannot be undone.")) e.preventDefault();
                          }}
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {editingId === event.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <form
                      action={updateEventAction}
                      className="space-y-4"
                      onSubmit={(e) => {
                        const form = e.currentTarget;
                        const timeEl = form.elements.namedItem("time") as HTMLInputElement | null;
                        if (timeEl) {
                          const cleaned = cleanTimeInput(timeEl.value);
                          if (cleaned !== "" && !isValidHHMM(cleaned)) {
                            e.preventDefault();
                            timeEl.focus();
                            timeEl.setCustomValidity("Enter time as HH:MM (e.g. 20:30)");
                            timeEl.reportValidity();
                            return;
                          }
                          timeEl.setCustomValidity("");
                          timeEl.value = cleaned;
                        }
                      }}
                    >
                      <input type="hidden" name="eventId" value={event.id} />
                      <input type="hidden" name="pinboardId" value={pinboardId} />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                          type="text"
                          name="title"
                          required
                          maxLength={80}
                          defaultValue={event.title}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                          <input
                            type="date"
                            name="date"
                            required
                            defaultValue={event.date}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time (optional)
                          </label>

                          {/* Safari-proof time input */}
                          <input
                            type="text"
                            name="time"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="HH:MM"
                            defaultValue={normalizeTimeForInput(event.time)}
                            onInput={(e) => {
                              e.currentTarget.value = cleanTimeInput(e.currentTarget.value);
                              e.currentTarget.setCustomValidity("");
                            }}
                            onBlur={(e) => {
                              const v = e.currentTarget.value.trim();
                              if (v === "") {
                                e.currentTarget.setCustomValidity("");
                                return;
                              }
                              if (!isValidHHMM(v)) {
                                e.currentTarget.setCustomValidity("Enter time as HH:MM (e.g. 20:30)");
                                e.currentTarget.reportValidity();
                              } else {
                                e.currentTarget.setCustomValidity("");
                              }
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location (optional)
                        </label>
                        <input
                          type="text"
                          name="location"
                          maxLength={120}
                          defaultValue={event.location || ""}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (optional)
                        </label>
                        <textarea
                          name="description"
                          maxLength={2000}
                          rows={4}
                          defaultValue={event.description || ""}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum 2,000 characters.</p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
