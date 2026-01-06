"use client";
import { useState } from "react";
import NoteModal from "@/app/components/NoteModal";

type NotePin = {
  id: string;
  title: string | null;
  body_markdown: string;
};

export default function NotesClient({ notes }: { notes: NotePin[] }) {
  const [selectedNote, setSelectedNote] = useState<NotePin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFirstWords = (text: string, count: number = 20): string => {
    // Remove markdown formatting for preview
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
            <div
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              {note.title && (
                <h3 className="font-medium mb-2 text-lg">{note.title}</h3>
              )}
              <p className="text-sm text-gray-700">
                {preview}
                {hasMore && "..."}
              </p>
              {hasMore && (
                <p className="text-xs text-blue-600 mt-2">Click to view full note</p>
              )}
            </div>
          );
        })}
      </div>

      <NoteModal
        note={selectedNote}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

