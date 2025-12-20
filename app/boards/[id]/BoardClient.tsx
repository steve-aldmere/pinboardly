// app/boards/[id]/BoardClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BoardType = "notes" | "calendar" | "links";

export type Board = {
  id: string;
  title: string;
  description?: string | null;
  board_type: BoardType;
  is_public?: boolean | null;
};

export type Pin = {
  id: string;
  board_id: string;
  content: string;
  created_at?: string;
  url?: string | null;
  event_date?: string | null;
};

type BoardClientProps = {
  board: Board;
  initialPins: Pin[];
};

export default function BoardClient({ board, initialPins }: BoardClientProps) {
  const router = useRouter();

  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [creating, setCreating] = useState(false);
  const [deletingPinId, setDeletingPinId] = useState<string | null>(null);
  const [deletingBoard, setDeletingBoard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [noteContent, setNoteContent] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDateTime, setEventDateTime] = useState(""); // datetime-local string
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNotes, setLinkNotes] = useState("");

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await fetch(`/api/pins?boardId=${board.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setPins(data);
      } catch (err) {
        console.error("Failed to fetch pins", err);
      }
    };

    fetchPins();
  }, [board.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let payload: any = { boardId: board.id };

    if (board.board_type === "notes") {
      if (!noteContent.trim()) return;
      payload.content = noteContent.trim();
    } else if (board.board_type === "calendar") {
      if (!eventTitle.trim() || !eventDateTime) return;
      payload.content = eventTitle.trim();
      payload.event_date = eventDateTime; // datetime-local string, Supabase will cast
    } else if (board.board_type === "links") {
      if (!linkUrl.trim()) return;
      payload.url = linkUrl.trim();
      payload.content = linkNotes.trim() || linkUrl.trim();
    }

    setCreating(true);
    try {
      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create item");
      }

      const created: Pin = await res.json();
      setPins((prev) => [created, ...prev]);

      // Clear form
      setNoteContent("");
      setEventTitle("");
      setEventDateTime("");
      setLinkUrl("");
      setLinkNotes("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while creating the item");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePin = async (id: string) => {
    if (!confirm("Delete this item?")) return;

    setDeletingPinId(id);
    setError(null);

    try {
      const res = await fetch(`/api/pins?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete item");
      }

      setPins((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while deleting");
    } finally {
      setDeletingPinId(null);
    }
  };

  const handleDeleteBoard = async () => {
    if (!confirm("Delete this board and all its items?")) return;

    setDeletingBoard(true);
    setError(null);

    try {
      const res = await fetch(`/api/boards?id=${board.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete board");
      }

      router.push("/boards");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong deleting the board");
      setDeletingBoard(false);
    }
  };

  const boardLabel =
    board.board_type === "calendar"
      ? "event"
      : board.board_type === "links"
      ? "link"
      : "note";

  const renderFormFields = () => {
    if (board.board_type === "calendar") {
      return (
        <>
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Event title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
            <input
              type="datetime-local"
              className="w-full md:w-56 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
            />
          </div>
        </>
      );
    }

    if (board.board_type === "links") {
      return (
        <>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Optional notes"
            value={linkNotes}
            onChange={(e) => setLinkNotes(e.target.value)}
          />
        </>
      );
    }

    // notes board
    return (
      <textarea
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={3}
        placeholder="Write your note..."
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
      />
    );
  };

  const canSubmit =
    board.board_type === "notes"
      ? noteContent.trim().length > 0
      : board.board_type === "calendar"
      ? eventTitle.trim().length > 0 && !!eventDateTime
      : linkUrl.trim().length > 0;

  const formatDate = (pin: Pin) => {
    if (pin.event_date) {
      return new Date(pin.event_date).toLocaleString();
    }
    if (pin.created_at) {
      return new Date(pin.created_at).toLocaleString();
    }
    return "";
  };

  const renderPinContent = (pin: Pin) => {
    if (board.board_type === "links") {
      const href = pin.url || pin.content;
      return (
        <div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {href}
          </a>
          {pin.content && pin.content !== href && (
            <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
              {pin.content}
            </p>
          )}
        </div>
      );
    }

    if (board.board_type === "calendar") {
      return (
        <div>
          <p className="text-sm font-medium whitespace-pre-wrap">
            {pin.content}
          </p>
          {formatDate(pin) && (
            <p className="mt-1 text-xs text-gray-500">
              {formatDate(pin)}
            </p>
          )}
        </div>
      );
    }

    // notes
    return (
      <div>
        <p className="text-sm whitespace-pre-wrap">{pin.content}</p>
        {formatDate(pin) && (
          <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
            {formatDate(pin)}
          </p>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <section className="max-w-3xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/boards")}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            ← Back to boards
          </button>

          <button
            type="button"
            onClick={handleDeleteBoard}
            disabled={deletingBoard}
            className="text-[11px] text-red-500 hover:text-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deletingBoard ? "Deleting board..." : "Delete board"}
          </button>
        </div>

        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">{board.title}</h1>
          {board.description ? (
            <p className="text-sm text-gray-600">{board.description}</p>
          ) : null}
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {board.board_type} board
          </p>
        </header>

        {/* Create new item */}
        <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
          <h2 className="text-sm font-medium">Add a new {boardLabel}</h2>

          <form onSubmit={handleCreate} className="space-y-3">
            {renderFormFields()}

            <div className="flex items-center justify-between">
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={creating || !canSubmit}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                {creating ? "Saving..." : `Add ${boardLabel}`}
              </button>
            </div>
          </form>
        </section>

        {/* List items */}
        <section className="space-y-3">
          {pins.length === 0 ? (
            <p className="text-sm text-gray-500">
              No {boardLabel}s yet. Create the first one above.
            </p>
          ) : (
            <ul className="space-y-3">
              {pins.map((pin) => (
                <li
                  key={pin.id}
                  className="flex items-start justify-between rounded-md border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <div className="pr-3 flex-1">
                    {renderPinContent(pin)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePin(pin.id)}
                    disabled={deletingPinId === pin.id}
                    className="ml-2 text-[11px] text-red-500 hover:text-red-600 disabled:cursor-not-allowed"
                  >
                    {deletingPinId === pin.id ? "Deleting..." : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
