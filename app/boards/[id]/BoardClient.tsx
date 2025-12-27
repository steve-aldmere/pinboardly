"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type Board = {
  id: string;
  title: string;
  description: string | null;
  board_type: "notes" | "links" | "calendar";
  is_public: boolean;
  slug: string;
  created_at: string;
  org_slug: string | null;
  created_by: string;
};

type NoteRow = {
  id: string;
  board_id: string;
  content: string | null;
  created_by: string;
  created_at: string;
};

type LinkRow = {
  id: string;
  board_id: string;
  title: string | null;
  url: string;
  note: string | null;
  created_by: string;
  created_at: string;
};

type EventRow = {
  id: string;
  board_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export default function BoardClient({ boardId }: { boardId: string }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // content state
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);

  // create state
  const [noteContent, setNoteContent] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNote, setLinkNote] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventStarts, setEventStarts] = useState("");
  const [eventEnds, setEventEnds] = useState("");
  const [eventAllDay, setEventAllDay] = useState(false);
  const [eventLocation, setEventLocation] = useState("");
  const [eventDesc, setEventDesc] = useState("");

  const [busy, setBusy] = useState(false);

  async function requireAuthOrRedirect(): Promise<string | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      router.push("/login");
      return null;
    }
    return userData.user.id;
  }

  async function loadBoard() {
    setLoadingBoard(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("boards")
      .select("id,title,description,board_type,is_public,slug,created_at,org_slug,created_by")
      .eq("id", boardId)
      .single();

    setLoadingBoard(false);

    if (error) {
      setErrorMsg(error.message);
      setBoard(null);
      return;
    }

    setBoard(data as Board);
  }

  async function loadContent(b: Board) {
    setErrorMsg("");

    if (b.board_type === "notes") {
      const { data, error } = await supabase
        .from("notes")
        .select("id,board_id,content,created_by,created_at")
        .eq("board_id", b.id)
        .order("created_at", { ascending: true });

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setNotes((data ?? []) as NoteRow[]);
      return;
    }

    if (b.board_type === "links") {
      const { data, error } = await supabase
        .from("links")
        .select("id,board_id,title,url,note,created_by,created_at")
        .eq("board_id", b.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setLinks((data ?? []) as LinkRow[]);
      return;
    }

    if (b.board_type === "calendar") {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id,board_id,title,description,location,starts_at,ends_at,all_day,created_by,created_at,updated_at")
        .eq("board_id", b.id)
        .order("starts_at", { ascending: true });

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setEvents((data ?? []) as EventRow[]);
      return;
    }
  }

  useEffect(() => {
    loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  useEffect(() => {
    if (board) loadContent(board);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.id, board?.board_type]);

  async function addNote() {
    setErrorMsg("");
    const content = noteContent.trim();
    if (!content || !board) return;

    setBusy(true);
    const uid = await requireAuthOrRedirect();
    if (!uid) {
      setBusy(false);
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({ board_id: board.id, content, created_by: uid } as any)
      .select("id,board_id,content,created_by,created_at")
      .single();

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setNoteContent("");
    setNotes((prev) => [...prev, data as NoteRow]);
  }

  async function deleteNote(id: string) {
    if (!board) return;
    const ok = window.confirm("Delete this note?");
    if (!ok) return;

    setBusy(true);
    setErrorMsg("");

    const uid = await requireAuthOrRedirect();
    if (!uid) {
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("notes").delete().eq("id", id);
    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  async function addLink() {
    setErrorMsg("");
    if (!board) return;

    const url = linkUrl.trim();
    if (!url) {
      setErrorMsg("URL is required.");
      return;
    }

    setBusy(true);
    const uid = await requireAuthOrRedirect();
    if (!uid) {
      setBusy(false);
      return;
    }

    const payload: any = {
      board_id: board.id,
      created_by: uid,
      url,
      title: linkTitle.trim() ? linkTitle.trim() : null,
      note: linkNote.trim() ? linkNote.trim() : null,
    };

    const { data, error } = await supabase
      .from("links")
      .insert(payload)
      .select("id,board_id,title,url,note,created_by,created_at")
      .single();

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setLinkTitle("");
    setLinkUrl("");
    setLinkNote("");
    setLinks((prev) => [data as LinkRow, ...prev]);
  }

  async function deleteLink(id: string) {
    const ok = window.confirm("Delete this link?");
    if (!ok) return;

    setBusy(true);
    setErrorMsg("");

    const uid = await requireAuthOrRedirect();
    if (!uid) {
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("links").delete().eq("id", id);
    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function toIsoMaybe(v: string) {
    // Accept: "2025-12-24T10:00" from datetime-local
    const s = v.trim();
    return s ? new Date(s).toISOString() : "";
  }

  async function addEvent() {
    setErrorMsg("");
    if (!board) return;

    const t = eventTitle.trim();
    if (!t) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!eventStarts.trim()) {
      setErrorMsg("Start time/date is required.");
      return;
    }

    setBusy(true);
    const uid = await requireAuthOrRedirect();
    if (!uid) {
      setBusy(false);
      return;
    }

    const payload: any = {
      board_id: board.id,
      created_by: uid,
      title: t,
      description: eventDesc.trim() ? eventDesc.trim() : null,
      location: eventLocation.trim() ? eventLocation.trim() : null,
      all_day: !!eventAllDay,
      starts_at: toIsoMaybe(eventStarts),
      ends_at: eventEnds.trim() ? toIsoMaybe(eventEnds) : null,
      // org_slug column exists, but for v1 we should not rely on it.
      // If your DB still requires org_slug NOT NULL, you must set it here:
      // org_slug: board.org_slug,
    };

    const { data, error } = await supabase
      .from("calendar_events")
      .insert(payload)
      .select("id,board_id,title,description,location,starts_at,ends_at,all_day,created_by,created_at,updated_at")
      .single();

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setEventTitle("");
    setEventStarts("");
    setEventEnds("");
    setEventAllDay(false);
    setEventLocation("");
    setEventDesc("");

    setEvents((prev) => [...prev, data as EventRow].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
  }

  async function deleteEvent(id: string) {
    const ok = window.confirm("Delete this event?");
    if (!ok) return;

    setBusy(true);
    setErrorMsg("");

    const uid = await requireAuthOrRedirect();
    if (!uid) {
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  if (loadingBoard) {
    return <div>Loading...</div>;
  }

  if (!board) {
    return <div className="text-red-600">Board not found. {errorMsg ? `(${errorMsg})` : ""}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{board.title}</h1>
        {board.description ? <p className="text-gray-600 mt-1">{board.description}</p> : null}
        <p className="text-sm text-gray-500 mt-2">
          {board.board_type} · {board.is_public ? "Public" : "Private"}
        </p>
      </div>

      {errorMsg ? <p className="text-sm text-red-600 mb-4">{errorMsg}</p> : null}

      {board.board_type === "notes" ? (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write a note…"
              className="w-full border rounded-lg p-3"
              rows={4}
            />
            <div className="mt-3">
              <button
                onClick={addNote}
                disabled={busy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                Add note
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="border rounded-lg p-4">
                <div className="whitespace-pre-wrap">{n.content}</div>
                <div className="mt-3">
                  <button className="underline text-sm" disabled={busy} onClick={() => deleteNote(n.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {notes.length === 0 ? <p className="text-gray-600">No notes yet.</p> : null}
          </div>
        </div>
      ) : null}

      {board.board_type === "links" ? (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <input
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full border rounded-lg p-3"
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://…"
              className="w-full border rounded-lg p-3"
              required
            />
            <textarea
              value={linkNote}
              onChange={(e) => setLinkNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full border rounded-lg p-3"
              rows={3}
            />
            <button
              onClick={addLink}
              disabled={busy}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Add link
            </button>
          </div>

          <div className="space-y-3">
            {links.map((l) => (
              <div key={l.id} className="border rounded-lg p-4">
                <div className="font-medium">{l.title ?? l.url}</div>
                <a className="underline text-sm break-all" href={l.url} target="_blank" rel="noreferrer">
                  {l.url}
                </a>
                {l.note ? <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{l.note}</div> : null}
                <div className="mt-3">
                  <button className="underline text-sm" disabled={busy} onClick={() => deleteLink(l.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {links.length === 0 ? <p className="text-gray-600">No links yet.</p> : null}
          </div>
        </div>
      ) : null}

      {board.board_type === "calendar" ? (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event title"
              className="w-full border rounded-lg p-3"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={eventStarts}
                onChange={(e) => setEventStarts(e.target.value)}
                type="datetime-local"
                className="w-full border rounded-lg p-3"
              />
              <input
                value={eventEnds}
                onChange={(e) => setEventEnds(e.target.value)}
                type="datetime-local"
                className="w-full border rounded-lg p-3"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={eventAllDay}
                onChange={(e) => setEventAllDay(e.target.checked)}
              />
              All day
            </label>

            <input
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Location (optional)"
              className="w-full border rounded-lg p-3"
            />

            <textarea
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border rounded-lg p-3"
              rows={3}
            />

            <button
              onClick={addEvent}
              disabled={busy}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Add event
            </button>
          </div>

          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="border rounded-lg p-4">
                <div className="font-medium">{ev.title}</div>
                <div className="text-sm text-gray-600">
                  {new Date(ev.starts_at).toLocaleString()}
                  {ev.ends_at ? ` → ${new Date(ev.ends_at).toLocaleString()}` : ""}
                  {ev.all_day ? " · All day" : ""}
                </div>
                {ev.location ? <div className="text-sm mt-1">{ev.location}</div> : null}
                {ev.description ? (
                  <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{ev.description}</div>
                ) : null}
                <div className="mt-3">
                  <button className="underline text-sm" disabled={busy} onClick={() => deleteEvent(ev.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {events.length === 0 ? <p className="text-gray-600">No events yet.</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
