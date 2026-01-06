"use client";
import { useState } from "react";
import { addLinkAction, updateLinkAction, deleteLinkAction, reorderLinksAction } from "./actions";

type Link = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  sort_order: number;
};

export default function LinkManager({
  pinboardId,
  initialLinks,
}: {
  pinboardId: string;
  initialLinks: Link[];
}) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
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

    const draggedIndex = links.findIndex((link) => link.id === draggedId);
    const dropIndex = links.findIndex((link) => link.id === dropId);

    if (draggedIndex === -1 || dropIndex === -1) {
      setDraggedId(null);
      return;
    }

    // Create new array with reordered items
    const newLinks = [...links];
    const [removed] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(dropIndex, 0, removed);

    // Update local state optimistically
    setLinks(newLinks);
    setDraggedId(null);
    setIsSaving(true);

    try {
      // Extract IDs in new order
      const orderedLinkIds = newLinks.map((link) => link.id);
      const result = await reorderLinksAction(pinboardId, orderedLinkIds);
      if (!result?.ok) {
        // Revert on error
        setLinks(links);
        const errorMessage = result?.error ?? "Failed to reorder links. Please try again.";
        alert(errorMessage);
        return;
      }
    } catch (error) {
      // Revert on error
      setLinks(links);
      console.error("Failed to reorder links:", error);
      alert("Failed to reorder links. Please try again.");
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
          <h2 className="text-2xl font-semibold">Links</h2>
          <p className="text-sm text-gray-500 mt-1">
            {links.length} / 50 links
          </p>
          {links.length >= 2 && (
            <p className="text-xs text-gray-400 mt-1">
              Drag items to reorder
            </p>
          )}
        </div>
        {links.length < 50 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Add Link
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-4">Add New Link</h3>
          <form action={addLinkAction} className="space-y-4">
            <input type="hidden" name="pinboardId" value={pinboardId} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                maxLength={80}
                placeholder="e.g., Scout Association Website"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                name="url"
                required
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                name="description"
                maxLength={280}
                rows={2}
                placeholder="Brief description..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Add Link
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

      {links.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No links yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Add your first link to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div
              key={link.id}
              onDragOver={(e) => handleDragOver(e, link.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, link.id)}
              className={`bg-white border rounded-lg p-4 transition-all ${
                draggedId === link.id
                  ? "opacity-50 border-blue-400"
                  : dragOverId === link.id
                  ? "border-blue-500 shadow-md border-2"
                  : "border-gray-200"
              } ${isSaving ? "opacity-75" : "hover:shadow-sm"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  {links.length >= 2 && (
                    <div
                      draggable={!isSaving}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(e, link.id);
                      }}
                      onDragEnd={(e) => {
                        e.stopPropagation();
                        handleDragEnd();
                      }}
                      className={`cursor-grab active:cursor-grabbing flex-shrink-0 pt-1 select-none ${
                        isSaving ? "cursor-wait opacity-50" : "hover:text-gray-600"
                      }`}
                      style={{ userSelect: "none" }}
                    >
                      <span className="text-gray-400 text-xl leading-none">≡</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{link.title}</h3>
                    
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {link.url}
                    </a>
                    {link.description && (
                      <p className="text-sm text-gray-600 mt-2">{link.description}</p>
                    )}
                  </div>
                </div>
                {editingId === link.id ? (
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
                      onClick={() => setEditingId(link.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                      disabled={isSaving}
                    >
                      Edit
                    </button>
                    <form action={deleteLinkAction}>
                      <input type="hidden" name="linkId" value={link.id} />
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
                          if (!confirm("Remove this link? This cannot be undone.")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                )}
              </div>
              {editingId === link.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <form action={updateLinkAction} className="space-y-4">
                    <input type="hidden" name="linkId" value={link.id} />
                    <input type="hidden" name="pinboardId" value={pinboardId} />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        maxLength={80}
                        defaultValue={link.title}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL *
                      </label>
                      <input
                        type="url"
                        name="url"
                        required
                        defaultValue={link.url}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        name="description"
                        maxLength={280}
                        rows={2}
                        defaultValue={link.description || ""}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
          ))}
        </div>
      )}
    </div>
  );
}