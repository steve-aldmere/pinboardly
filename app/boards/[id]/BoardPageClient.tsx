"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type Board = {
  id: string;
  title: string;
  description: string | null;
  board_type: "notes" | "links" | "calendar";
  is_public: boolean;
  org_slug: string | null;
};

type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
};

type NoteRow = {
  id: string;
  content: string | null;
  created_at: string;
};

type LinkRow = {
  id: string;
  title: string | null;
  url: string;
  note: string | null;
  created_at: string;
};

function normalizeUrl(u: string) {
  const trimmed = u.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

export default function BoardPageClient({ id }: { id: string }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Calendar state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [calendarError, setCalendarError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg("");
      setCalendarError("");

      // Try to get user, but do NOT force login yet
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id ?? null;
      setUserId(uid);

      // Load board first
      const { data: boardData, error: boardErr } = await supabase
        .from("boards")
        .select("id,title,description,board_type,is_public,org_slug")
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (boardErr) {
        setErrorMsg(boardErr.message);
        setLoading(false);
        return;
      }

      const b = boardData as Board;
      setBoard(b);

      // If board is NOT public and user isn't signed in, redirect to login
      if (!b.is_public && !uid) {
        router.push(`/login?next=/boards/${encodeURIComponent(id)}`);
        return;
      }

      // Load calendar events if needed
      if (b.board_type === "calendar") {
        const { data: eventsData, error: eventsErr } = await supabase
          .from("calendar_events")
          .select("id,title,starts_at,ends_at")
          .eq("board_id", id)
          .order("starts_at", { ascending: true });

        if (cancelled) return;

        if (eventsErr) {
          setCalendarError(eventsErr.message);
        } else {
          setEvents((eventsData ?? []) as CalendarEvent[]);
        }
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, router, supabase]);

  async function createEvent() {
    if (!board || !eventTitle.trim() || !eventDate) return;
    if (!userId) {
      router.push(`/login?next=/boards/${encodeURIComponent(id)}`);
      return;
    }

    setCreatingEvent(true);
    setCalendarError("");

    const { error } = await supabase.from("calendar_events").insert({
      board_id: board.id,
      org_slug: board.org_slug,
      title: eventTitle.trim(),
      starts_at: new Date(eventDate).toISOString(),
      created_by: userId,
    });

    if (error) {
      setCalendarError(error.message);
      setCreatingEvent(false);
      return;
    }

    setEventTitle("");
    setEventDate("");

    const { data: eventsData, error: eventsErr } = await supabase
      .from("calendar_events")
      .select("id,title,starts_at,ends_at")
      .eq("board_id", board.id)
      .order("starts_at", { ascending: true });

    if (eventsErr) {
      setCalendarError(eventsErr.message);
      setCreatingEvent(false);
      return;
    }

    setEvents((eventsData ?? []) as CalendarEvent[]);
    setCreatingEvent(false);
  }

  if (loading) return <p className="p-6 text-sm text-gray-600">Loading board...</p>;

  if (errorMsg || !board) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{errorMsg || "Board not found."}</p>
      </div>
    );
  }

  const canWrite = Boolean(userId); // simple rule for now

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between">
        <Link
          href={board.org_slug ? `/${board.org_slug}` : "/boards"}
          className="underline text-sm"
        >
          Back
        </Link>
        <span className="text-sm text-gray-600">{board.board_type}</span>
      </div>

      <h1 className="mt-4 text-3xl font-semibold">{board.title}</h1>

      <div className="mt-2 text-sm text-gray-600">
        {board.board_type} · {board.is_public ? "Public" : "Private"}
        {board.org_slug ? ` · /${board.org_slug}` : null}
      </div>

      {board.description ? <p className="mt-2 text-gray-600">{board.description}</p> : null}

      {/* NOTES */}
      {board.board_type === "notes" && (
        <NotesSection boardId={board.id} supabase={supabase} canWrite={canWrite} />
      )}

      {/* LINKS */}
      {board.board_type === "links" && (
        <LinksSection boardId={board.id} supabase={supabase} canWrite={canWrite} />
      )}

      {/* CALENDAR */}
      {board.board_type === "calendar" && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Events</h2>

          {calendarError ? <p className="mt-2 text-sm text-red-600">{calendarError}</p> : null}

          <div className="mt-4 grid gap-2">
            {events.length === 0 ? (
              <p className="text-sm text-gray-600">No events yet.</p>
            ) : (
              events.map((e) => (
                <div key={e.id} className="rounded border p-3">
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(e.starts_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {canWrite ? (
            <div className="mt-6 rounded border p-4">
              <div className="font-semibold text-sm">Add event</div>

              <input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                className="mt-2 w-full border rounded px-3 py-2"
              />

              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-2 w-full border rounded px-3 py-2"
              />

              <button
                onClick={createEvent}
                disabled={creatingEvent}
                className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {creatingEvent ? "Creating..." : "Create event"}
              </button>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-600">Sign in to add events.</p>
          )}
        </div>
      )}
    </div>
  );
}

function NotesSection({
  boardId,
  supabase,
  canWrite,
}: {
  boardId: string;
  supabase: ReturnType<typeof getSupabaseClient>;
  canWrite: boolean;
}) {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function reload() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("notes")
      .select("id,content,created_at")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setNotes([]);
      setLoading(false);
      return;
    }

    setNotes((data ?? []) as NoteRow[]);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  async function addNote() {
    const text = content.trim();
    if (!text) return;

    setSaving(true);
    setErr("");

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) {
      setErr("Please sign in to add notes.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("notes").insert({
      board_id: boardId,
      content: text,
      created_by: uid,
    });

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setContent("");
    await reload();
    setSaving(false);
  }

  async function deleteNote(noteId: string) {
    setErr("");
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (error) {
      setErr(error.message);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">Notes</h2>

      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}

      {canWrite ? (
        <div className="mt-4 rounded border p-4">
          <div className="text-sm font-semibold">Add note</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a note..."
            className="mt-2 w-full border rounded px-3 py-2"
            rows={4}
          />
          <button
            onClick={addNote}
            disabled={saving}
            className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add note"}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">Sign in to add or delete notes.</p>
      )}

      <div className="mt-4 grid gap-2">
        {loading ? (
          <p className="text-sm text-gray-600">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-600">No notes yet.</p>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="rounded border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="whitespace-pre-wrap flex-1">{n.content}</div>
                {canWrite ? (
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="text-sm underline text-red-600"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LinksSection({
  boardId,
  supabase,
  canWrite,
}: {
  boardId: string;
  supabase: ReturnType<typeof getSupabaseClient>;
  canWrite: boolean;
}) {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  async function reload() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("links")
      .select("id,title,url,note,created_at")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLinks([]);
      setLoading(false);
      return;
    }

    setLinks((data ?? []) as LinkRow[]);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  async function addLink() {
    const u = normalizeUrl(url);
    if (!u) return;

    setSaving(true);
    setErr("");

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) {
      setErr("Please sign in to add links.");
      setSaving(false);
      return;
    }

    const payload = {
      board_id: boardId,
      created_by: uid,
      url: u,
      title: title.trim() ? title.trim() : null,
      note: note.trim() ? note.trim() : null,
    };

    const { error } = await supabase.from("links").insert(payload);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setUrl("");
    setNote("");
    await reload();
    setSaving(false);
  }

  async function deleteLink(linkId: string) {
    setErr("");
    const { error } = await supabase.from("links").delete().eq("id", linkId);
    if (error) {
      setErr(error.message);
      return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">Links</h2>

      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}

      {canWrite ? (
        <div className="mt-4 rounded border p-4">
          <div className="text-sm font-semibold">Add link</div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="mt-2 w-full border rounded px-3 py-2"
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (required)"
            className="mt-2 w-full border rounded px-3 py-2"
          />

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="mt-2 w-full border rounded px-3 py-2"
            rows={3}
          />

          <button
            onClick={addLink}
            disabled={saving}
            className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add link"}
          </button>

          <p className="mt-2 text-xs text-gray-500">
            Tip: if you paste a URL without https:// it will be added for you.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">Sign in to add or delete links.</p>
      )}

      <div className="mt-4 grid gap-2">
        {loading ? (
          <p className="text-sm text-gray-600">Loading links...</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-gray-600">No links yet.</p>
        ) : (
          links.map((l) => (
            <div key={l.id} className="rounded border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold"
                  >
                    {l.title?.trim() ? l.title : l.url}
                  </a>
                  {l.note ? <div className="mt-1 text-sm text-gray-700">{l.note}</div> : null}
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(l.created_at).toLocaleString()}
                  </div>
                </div>

                {canWrite ? (
                  <button
                    onClick={() => deleteLink(l.id)}
                    className="text-sm underline text-red-600"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
