"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

type NotePin = {
  id: string;
  title: string | null;
  body_markdown: string;
};

export default function NotesClient({ notes }: { notes: NotePin[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const slug = String((params as any)?.slug || "");
  const from = searchParams.get("from");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedNote = useMemo(() => {
    if (!selectedId) return null;
    return notes.find((n) => n.id === selectedId) ?? null;
  }, [notes, selectedId]);

  // Open note from URL: ?note=<id>
  useEffect(() => {
    const fromUrl = searchParams.get("note");
    if (!fromUrl) {
      setSelectedId(null);
      return;
    }
    // Only open if it exists in the list
    const exists = notes.some((n) => n.id === fromUrl);
    setSelectedId(exists ? fromUrl : null);
  }, [searchParams, notes]);

  // ESC closes
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (selectedId) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function setNoteInUrl(noteId: string) {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("note", noteId);
    router.push(`${pathname}?${qs.toString()}`, { scroll: false });
  }

  function clearNoteInUrl() {
    const qs = new URLSearchParams(searchParams.toString());
    qs.delete("note");

    const nextQs = qs.toString();
    router.push(nextQs ? `${pathname}?${nextQs}` : pathname, { scroll: false });
  }

  function openModal(note: NotePin) {
    setSelectedId(note.id);
    setNoteInUrl(note.id);
  }

  function closeModal() {
    setSelectedId(null);

    // If this note was opened from the main pinboard overview,
    // closing should return to the overview rather than leaving the user on /notes.
    if (from === "overview" && slug) {
      router.push(`/${slug}`, { scroll: false });
      return;
    }

    clearNoteInUrl();
  }

  const getFirstWords = (text: string, count: number = 20): string => {
    const plainText = text
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\n/g, " ")
      .trim();

    const words = plainText.split(/\s+/).filter((word) => word.length > 0);
    return words.slice(0, count).join(" ");
  };

  if (notes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No notes yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          This pinboard doesn't have any notes.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {notes.map((note) => {
          const preview = getFirstWords(note.body_markdown, 20);
          const hasMore = note.body_markdown.trim().split(/\s+/).length > 20;

          return (
            <button
              key={note.id}
              type="button"
              onClick={() => openModal(note)}
              className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              {note.title && (
                <h3 className="font-medium mb-2 text-lg">{note.title}</h3>
              )}
              <p className="text-sm text-gray-700">
                {preview}
                {hasMore && "..."}
              </p>
              <p className="text-xs text-blue-600 mt-2">Click to view full note</p>
            </button>
          );
        })}
      </div>

      {selectedNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Note detail"
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-black/40"
            aria-label="Close note"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-xl border border-gray-200">
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Note</div>
                <h3 className="text-xl font-semibold break-words">
                  {selectedNote.title || "Untitled note"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-4 max-h-[70vh] overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {selectedNote.body_markdown}
              </pre>
            </div>

            <div className="px-5 py-3 border-t text-xs text-gray-500">
              Shareable link:{" "}
              <span className="font-mono">{`?note=${selectedNote.id}`}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
