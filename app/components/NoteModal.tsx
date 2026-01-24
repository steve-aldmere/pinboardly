"use client";
import { useEffect } from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

type NotePin = {
  id: string;
  title: string | null;
  body_markdown: string;
};

export default function NoteModal({
  note,
  isOpen,
  onClose,
}: {
  note: NotePin | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          {note.title ? (
            <h2 className="text-2xl font-semibold">{note.title}</h2>
          ) : (
            <h2 className="text-2xl font-semibold text-muted-foreground">Note</h2>
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="break-words">
            <MarkdownRenderer content={note.body_markdown} />
          </div>
        </div>
      </div>
    </div>
  );
}

