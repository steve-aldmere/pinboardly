"use client";
import { useState } from "react";
import Link from "next/link";
import NoteModal from "@/app/components/NoteModal";

type NotePin = {
  id: string;
  title: string | null;
  body_markdown: string;
};

export default function NotesOverviewClient({
  notes,
  slug,
}: {
  notes: NotePin[];
  slug: string;
}) {
  const [selectedNote, setSelectedNote] = useState<NotePin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFirstWords = (text: string, count: number = 5): string => {
    // Remove markdown formatting for preview (basic cleanup)
    const plainText = text
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .replace(/`([^`]+)`/g, "$1") // Remove code
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim();

    const words = plainText.split(/\s+/).filter((word) => word.length > 0);
    return words.slice(0, count).join(" ");
  };

  const handleNoteClick = (note: NotePin) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  if (notes.length === 0) {
    return null;
  }

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Notes</h2>
          <Link
            href={`/${slug}/notes`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-4">
          {notes.map((note) => {
            const preview = getFirstWords(note.body_markdown, 5);
            const hasMore = note.body_markdown.trim().split(/\s+/).length > 5;

            return (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                {note.title && (
                  <h3 className="font-medium mb-1">{note.title}</h3>
                )}
                <p className="text-sm text-gray-700">
                  {preview}
                  {hasMore && "..."}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <NoteModal
        note={selectedNote}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}





