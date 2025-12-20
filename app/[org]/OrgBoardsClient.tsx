// app/[org]/OrgBoardsClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrgBoardsClient({
  orgSlug,
  org,
  initialBoards,
  loadError,
  orgError,
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialBoards || []);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [boardType, setBoardType] = useState("notes");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(loadError || null);

  const displayName = org?.name || orgSlug;
  const tagline = org?.description || `Boards shared at /${orgSlug}`;
  const primaryColor = org?.primary_color || "#0f172a"; // slate as fallback
  const accentColor = org?.accent_color || "#38bdf8";  // cyan fallback
  const logoUrl = org?.logo_url || null;

  if (orgError) {
    return (
      <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
        <section className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-2xl font-semibold">Organisation not found</h1>
          <p className="text-sm text-gray-600">
            We could not find an organisation for
            {" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
              {orgSlug}
            </code>
            .
          </p>
        </section>
      </main>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch(`/api/boards?orgSlug=${orgSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          board_type: boardType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create board");
      }

      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setTitle("");
      setDescription("");
      setBoardType("notes");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const openBoard = (board) => {
    router.push(`/boards/${board.id}`);
  };

  const handleDeleteBoard = async (id) => {
    if (!confirm("Delete this board and all its items?")) return;

    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/boards?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete board");
      }

      setItems((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong deleting the board");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <section className="max-w-4xl mx-auto space-y-6">
        {/* Branded hero */}
        <div
          className="rounded-2xl px-5 py-6 md:px-7 md:py-7 flex gap-4 items-center shadow-sm"
          style={{ backgroundColor: primaryColor, color: "#ffffff" }}
        >
          {logoUrl && (
            <div className="hidden md:block flex-shrink-0">
              <img
                src={logoUrl}
                alt={displayName}
                className="h-16 w-16 rounded-full object-cover border border-white/40"
              />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            <p className="text-sm opacity-90">{tagline}</p>
            <p className="text-xs opacity-70">
              Public link:
              {" "}
              <code className="bg-white/10 px-1 py-0.5 rounded text-[11px]">
                /{orgSlug}
              </code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/boards")}
            className="hidden md:inline-flex items-center rounded-md border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
          >
            Open admin view
          </button>
        </div>

        {/* Create board form */}
        <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
          <h2 className="text-sm font-medium">Create a new board</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex flex-col gap-2 md:flex-row">
              <input
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Board title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <select
                className="w-full md:w-40 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={boardType}
                onChange={(e) => setBoardType(e.target.value)}
              >
                <option value="notes">Notes</option>
                <option value="calendar">Calendar</option>
                <option value="links">Links</option>
              </select>
            </div>

            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex items-center justify-between">
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={creating || !title.trim()}
                className="inline-flex items-center rounded-md border border-transparent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentColor }}
              >
                {creating ? "Creating..." : "Create board"}
              </button>
            </div>
          </form>
        </section>

        {/* Boards list */}
        <section className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">
              No boards yet for {displayName}. Create the first one above.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((board) => (
                <div
                  key={board.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => openBoard(board)}
                    className="text-left flex-1"
                  >
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      {board.board_type || "board"}
                    </p>
                    <h3 className="text-sm font-semibold">
                      {board.title}
                    </h3>
                    {board.description && (
                      <p className="mt-1 text-xs text-gray-600 line-clamp-3">
                        {board.description}
                      </p>
                    )}
                  </button>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteBoard(board.id)}
                      disabled={deletingId === board.id}
                      className="text-[11px] text-red-500 hover:text-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {deletingId === board.id
                        ? "Deleting..."
                        : "Delete board"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
