"use client";
import { useState } from "react";
import { addNoteAction, updateNoteAction, deleteNoteAction, reorderNotesAction } from "./actions";

type Note = {
  id: string;
  title: string | null;
  body_markdown: string;
  sort_order: number;
};

// Simple markdown preview component
function MarkdownPreview({ content }: { content: string }) {
  // Basic markdown parsing - handles common markdown syntax
  const parseMarkdown = (text: string): string => {
    if (!text) return "";
    
    let html = text;
    
    // Process code blocks first (before escaping)
    const codeBlocks: string[] = [];
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      const id = `CODE_BLOCK_${codeBlocks.length}`;
      codeBlocks.push(code);
      return id;
    });
    
    // Process inline code
    const inlineCodes: string[] = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      const id = `INLINE_CODE_${inlineCodes.length}`;
      inlineCodes.push(code);
      return id;
    });
    
    // Escape HTML
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Restore code blocks (they're already escaped)
    codeBlocks.forEach((code, i) => {
      html = html.replace(`CODE_BLOCK_${i}`, `<pre class="bg-muted p-2 rounded overflow-x-auto my-2"><code>${code}</code></pre>`);
    });
    
    // Restore inline code
    inlineCodes.forEach((code, i) => {
      html = html.replace(`INLINE_CODE_${i}`, `<code class="bg-muted px-1 rounded">${code}</code>`);
    });
    
    // Process links (after escaping to avoid issues)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
    
    // Process headers (must be after code processing to avoid matching in code)
    const lines = html.split("\n");
    const processedLines: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      if (line.match(/^###\s+/)) {
        if (inList) {
          processedLines.push(`<ul>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h3 class="font-semibold text-lg mt-4 mb-2">${line.replace(/^###\s+/, "")}</h3>`);
        continue;
      }
      if (line.match(/^##\s+/)) {
        if (inList) {
          processedLines.push(`<ul>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h2 class="font-semibold text-xl mt-4 mb-2">${line.replace(/^##\s+/, "")}</h2>`);
        continue;
      }
      if (line.match(/^#\s+/)) {
        if (inList) {
          processedLines.push(`<ul>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h1 class="font-bold text-2xl mt-4 mb-2">${line.replace(/^#\s+/, "")}</h1>`);
        continue;
      }
      
      // Lists
      if (line.match(/^[-*]\s+/)) {
        if (!inList) {
          inList = true;
        }
        listItems.push(`<li class="ml-4 list-disc">${line.replace(/^[-*]\s+/, "")}</li>`);
        continue;
      }
      if (line.match(/^\d+\.\s+/)) {
        if (!inList) {
          inList = true;
        }
        listItems.push(`<li class="ml-4 list-decimal">${line.replace(/^\d+\.\s+/, "")}</li>`);
        continue;
      }
      
      // End list if we hit a non-list line
      if (inList && line.trim() === "") {
        processedLines.push(`<ul>${listItems.join("")}</ul>`);
        listItems = [];
        inList = false;
        processedLines.push("");
        continue;
      }
      if (inList) {
        processedLines.push(`<ul>${listItems.join("")}</ul>`);
        listItems = [];
        inList = false;
      }
      
      // Regular paragraph lines
      if (line.trim() === "") {
        processedLines.push("");
      } else {
        processedLines.push(line);
      }
    }
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      processedLines.push(`<ul>${listItems.join("")}</ul>`);
    }
    
    html = processedLines.join("\n");
    
    // Bold and italic (must be after list processing)
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    
    // Convert double newlines to paragraphs
    html = html.split("\n\n").map(para => {
      if (!para.trim()) return "";
      if (para.match(/^<(h[1-6]|ul|pre)/)) return para;
      return `<p class="mb-2">${para.replace(/\n/g, "<br />")}</p>`;
    }).join("\n");
    
    // Handle remaining single newlines
    html = html.replace(/\n/g, "<br />");
    
    return html;
  };

  return (
    <div
      className="text-sm text-foreground max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}

export default function NoteManager({
  pinboardId,
  initialNotes,
}: {
  pinboardId: string;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (isSaving) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    // Add a small delay to ensure state is set
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (isSaving || !draggedId || draggedId === id) {
      setDragOverId(null);
      return;
    }
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === dropId || isSaving) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = notes.findIndex((note) => note.id === draggedId);
    const dropIndex = notes.findIndex((note) => note.id === dropId);

    if (draggedIndex === -1 || dropIndex === -1) {
      setDraggedId(null);
      return;
    }

    // Create new array with reordered items
    const newNotes = [...notes];
    const [removed] = newNotes.splice(draggedIndex, 1);
    newNotes.splice(dropIndex, 0, removed);

    // Update local state optimistically
    setNotes(newNotes);
    setDraggedId(null);
    setIsSaving(true);

    try {
      // Extract IDs in new order
      const orderedNoteIds = newNotes.map((note) => note.id);
      const result = await reorderNotesAction(pinboardId, orderedNoteIds);
      if (!result?.ok) {
        throw new Error("Reorder failed");
      }
    } catch (error) {
      // Revert on error
      setNotes(notes);
      console.error("Failed to reorder notes:", error);
      alert("Failed to reorder notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Notes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {notes.length} / 50 notes
          </p>
          {notes.length >= 2 && (
            <p className="text-xs text-muted-foreground mt-1">
              Drag items to reorder
            </p>
          )}
        </div>
        {notes.length < 50 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary"
          >
            Add Note
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white border border-border rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-4">Add New Note</h3>
          <form action={addNoteAction} className="space-y-4">
            <input type="hidden" name="pinboardId" value={pinboardId} />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Title (optional)
              </label>
              <input
                type="text"
                name="title"
                maxLength={80}
                placeholder="e.g., Meeting Notes"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Content * (supports Markdown)
              </label>
              <textarea
                name="body_markdown"
                required
                maxLength={10000}
                rows={8}
                placeholder="Enter your note content (Markdown supported)..."
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Markdown is supported. Maximum 10,000 characters.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary"
              >
                Add Note
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-muted text-foreground text-sm rounded-lg hover:bg-tint"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="bg-muted border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No notes yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first note to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              onDragOver={(e) => handleDragOver(e, note.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, note.id)}
              className={`bg-white border rounded-lg p-4 transition-all ${
                draggedId === note.id
                  ? "opacity-50 border-border"
                  : dragOverId === note.id
                  ? "border-border shadow-md border-2"
                  : "border-border"
              } ${isSaving ? "opacity-75" : "hover:shadow-sm"}`}
            >
              {editingId === note.id ? (
                <form action={updateNoteAction} className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Edit Note</h3>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                  <input type="hidden" name="noteId" value={note.id} />
                  <input type="hidden" name="pinboardId" value={pinboardId} />
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      name="title"
                      maxLength={80}
                      defaultValue={note.title || ""}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Content * (supports Markdown)
                    </label>
                    <textarea
                      name="body_markdown"
                      required
                      maxLength={10000}
                      rows={8}
                      defaultValue={note.body_markdown}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Markdown is supported. Maximum 10,000 characters.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-muted text-foreground text-sm rounded-lg hover:bg-tint"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {notes.length >= 2 && (
                        <div
                          draggable={!isSaving}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            handleDragStart(e, note.id);
                          }}
                          onDragEnd={(e) => {
                            e.stopPropagation();
                            handleDragEnd();
                          }}
                          className={`cursor-grab active:cursor-grabbing flex-shrink-0 pt-1 select-none ${
                            isSaving ? "cursor-wait opacity-50" : "hover:text-muted-foreground"
                          }`}
                          style={{ userSelect: "none" }}
                        >
                          <span className="text-muted-foreground text-xl leading-none">≡</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {note.title && (
                          <h3 className="font-medium mb-2">{note.title}</h3>
                        )}
                        <div className="break-words">
                          <MarkdownPreview content={note.body_markdown} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <button
                        type="button"
                        onClick={() => setEditingId(note.id)}
                        className="text-sm text-primary hover:text-primary"
                        disabled={isSaving}
                      >
                        Edit
                      </button>
                      <form action={deleteNoteAction}>
                        <input type="hidden" name="noteId" value={note.id} />
                        <input type="hidden" name="pinboardId" value={pinboardId} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-700"
                          disabled={isSaving}
                          onClick={(e) => {
                            if (isSaving) {
                              e.preventDefault();
                              return;
                            }
                            if (!confirm("Remove this note? This cannot be undone.")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

