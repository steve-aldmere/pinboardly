"use client";

import { useEffect, useState } from "react";

type Note = {
  id: string;
  content: string;
  created_at: string;
};

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load notes on first render
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/notes");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load notes");
        }

        setNotes(data.notes || []);
      } catch (err: any) {
        setError(err.message || "Failed to load notes");
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save note");
      }

      // Prepend new note to the list
      setNotes((prev) => [data.note, ...prev]);
      setContent("");
    } catch (err: any) {
      setError(err.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setError(null);

      const res = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete note");
      }

      // Remove from local state
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Pinboardly Notes</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a note…"
          rows={3}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            resize: "vertical",
            marginBottom: "0.5rem",
          }}
        />

        <button
          type="submit"
          disabled={saving || !content.trim()}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
            background: saving ? "#999" : "#2563eb",
            color: "white",
            cursor: saving || !content.trim() ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save note"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading notes…</p>
      ) : notes.length === 0 ? (
        <p>No notes yet. Add your first one above.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                background: "#f9fafb",
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <div>
                <p style={{ margin: 0 }}>{note.content}</p>
                <small style={{ color: "#6b7280" }}>
                  {new Date(note.created_at).toLocaleString()}
                </small>
              </div>

              <button
                onClick={() => handleDelete(note.id)}
                disabled={deletingId === note.id}
                style={{
                  alignSelf: "flex-start",
                  border: "none",
                  background: deletingId === note.id ? "#fecaca" : "#ef4444",
                  color: "white",
                  borderRadius: "4px",
                  padding: "0.25rem 0.5rem",
                  cursor: deletingId === note.id ? "wait" : "pointer",
                  fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                }}
              >
                {deletingId === note.id ? "Deleting…" : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
