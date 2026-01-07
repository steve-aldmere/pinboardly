"use client";

import React, { useState } from "react";
import { deleteLinkAction, reorderLinksAction } from "./actions";

type Link = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  sort_order: number;
};

type FieldErrors = {
  title?: string;
  url?: string;
  description?: string;
};

type ZodIssueLike = {
  path?: Array<string | number>;
  message?: string;
};

export default function LinkManager({
  pinboardId,
  initialLinks,
}: {
  pinboardId: string;
  initialLinks: Link[];
}) {
  const normalizeUrlClient = (input: string) => {
    const s = (input || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    return `https://${s}`;
  };

  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const resetErrors = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (isSaving) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
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

  const handleDrop = async (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === dropId || isSaving) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = links.findIndex((l) => l.id === draggedId);
    const dropIndex = links.findIndex((l) => l.id === dropId);

    if (draggedIndex === -1 || dropIndex === -1) {
      setDraggedId(null);
      return;
    }

    const prevLinks = links;
    const newLinks = [...links];
    const [removed] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(dropIndex, 0, removed);

    setLinks(newLinks);
    setDraggedId(null);
    setIsSaving(true);

    try {
      const orderedIds = newLinks.map((l) => l.id);
      const result = await reorderLinksAction(pinboardId, orderedIds);
      if (!result?.ok) {
        setLinks(prevLinks);
        alert(result?.error ?? "Failed to reorder links. Please try again.");
      }
    } catch (err) {
      setLinks(prevLinks);
      console.error("Failed to reorder links:", err);
      alert("Failed to reorder links. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const submitToApi = async (url: string, form: HTMLFormElement) => {
    resetErrors();

    const formData = new FormData(form);

    // Force required fields the API needs to route correctly
    formData.set("type", "link");
    formData.set("pinboard_id", pinboardId);

    // Normalize URL before sending
    const urlVal = formData.get("url");
    if (typeof urlVal === "string") formData.set("url", normalizeUrlClient(urlVal));

    const res = await fetch(url, { method: "POST", body: formData });

    if (!res.ok) {
      let message = "Something went wrong. Please try again.";

      try {
        const json: any = await res.json();

        if (typeof json?.error === "string") {
          message = json.error;
        }

        if (json?.error === "Validation error" && Array.isArray(json?.details)) {
          const fe: FieldErrors = {};
          const issues = json.details as ZodIssueLike[];

          for (const issue of issues) {
            const key = Array.isArray(issue?.path) ? issue.path[0] : undefined;

            if (key === "title" || key === "url" || key === "description") {
              const k = key as keyof FieldErrors;
              fe[k] = issue?.message || "Invalid value";
            }
          }

          setFieldErrors(fe);
          message = "Please fix the highlighted fields.";
        }
      } catch {
        // ignore JSON parse errors
      }

      setFormError(message);
      return false;
    }

    return true;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Links</h2>
          <p className="text-sm text-gray-500 mt-1">{links.length} / 50 links</p>
          {links.length >= 2 && (
            <p className="text-xs text-gray-400 mt-1">Drag items to reorder</p>
          )}
        </div>

        {links.length < 50 && (
          <button
            onClick={() => {
              resetErrors();
              setEditingId(null);
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Add Link
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-4">Add New Link</h3>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await submitToApi("/api/pins", e.currentTarget);
              if (ok) window.location.reload();
            }}
          >
            {/* Hidden fields to keep API routing stable */}
            <input type="hidden" name="type" value="link" />
            <input type="hidden" name="pinboard_id" value={pinboardId} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                required
                maxLength={120}
                placeholder="e.g., Scout Association Website"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.title && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
              <input
                type="text"
                name="url"
                required
                placeholder="https://example.com"
                onBlur={(e) => {
                  e.currentTarget.value = normalizeUrlClient(e.currentTarget.value);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.url && <p className="text-xs text-red-600 mt-1">{fieldErrors.url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                name="description"
                maxLength={500}
                rows={2}
                placeholder="Brief description..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.description && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
              )}
            </div>

            <div className="flex gap-3 items-center">
              {formError && <p className="text-sm text-red-600">{formError}</p>}

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Add Link
              </button>

              <button
                type="button"
                onClick={() => {
                  resetErrors();
                  setShowAddForm(false);
                }}
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
          <p className="text-sm text-gray-500 mt-1">Add your first link to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              onDragOver={(e) => handleDragOver(e, link.id)}
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
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
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
                      onClick={() => {
                        resetErrors();
                        setEditingId(null);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button
                      type="button"
                      onClick={() => {
                        resetErrors();
                        setShowAddForm(false);
                        setEditingId(link.id);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                      disabled={isSaving}
                    >
                      Edit
                    </button>

                    {/* IMPORTANT: deleteLinkAction expects linkId + pinboardId */}
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
                          if (!confirm("Remove this link? This cannot be undone.")) e.preventDefault();
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
                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const ok = await submitToApi("/api/pins/update", e.currentTarget);
                      if (ok) window.location.reload();
                    }}
                  >
                    {/* IMPORTANT: update endpoint expects id + pinboard_id + type */}
                    <input type="hidden" name="type" value="link" />
                    <input type="hidden" name="pinboard_id" value={pinboardId} />
                    <input type="hidden" name="id" value={link.id} />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        name="title"
                        required
                        maxLength={120}
                        defaultValue={link.title}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {fieldErrors.title && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                      <input
                        type="text"
                        name="url"
                        required
                        defaultValue={link.url}
                        onBlur={(e) => {
                          e.currentTarget.value = normalizeUrlClient(e.currentTarget.value);
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {fieldErrors.url && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.url}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        name="description"
                        maxLength={500}
                        rows={2}
                        defaultValue={link.description || ""}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {fieldErrors.description && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
                      )}
                    </div>

                    <div className="flex gap-3 items-center">
                      {formError && <p className="text-sm text-red-600">{formError}</p>}

                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Save Changes
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetErrors();
                          setEditingId(null);
                        }}
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
