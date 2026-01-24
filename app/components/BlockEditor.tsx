"use client";

import { useState, FormEvent } from "react";

type Block = {
  id: string;
  page_id: string;
  type: string;
  content: any;
  sort_order: number;
};

export default function BlockEditor({
  pageId,
  initialBlocks,
}: {
  pageId: string;
  initialBlocks: Block[];
}) {
  const [text, setText] = useState("");
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          type: "text",
          content: { text: trimmed },
          order: blocks.length, // simple order: append at end
        }),
      });

      const data = await res.json();
      console.log("Status:", res.status);
      console.log("Response:", data);

      if (!res.ok) {
        setError(data.error || "Failed to save block");
        return;
      }

      // Add new block to the list so it appears immediately
      setBlocks((prev) => [...prev, data.block]);
      setText("");
    } catch (err: any) {
      console.error("Error saving block:", err);
      setError("Unexpected error saving block");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Editor */}
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border rounded p-3 text-black"
          rows={3}
          placeholder="Write something…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Block"}
        </button>
      </form>

      {/* Existing blocks */}
      <div className="mt-8 space-y-4">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="border rounded p-3 bg-white/5"
          >
            {block.type === "text" ? (
              <p>{block.content?.text}</p>
            ) : (
              <pre className="text-xs">
                {JSON.stringify(block.content, null, 2)}
              </pre>
            )}
          </div>
        ))}

        {blocks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No blocks on this page yet. Add your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
