"use client";

import { useRef } from "react";

export default function CalendarAddForm({ boardId }: { boardId: string }) {
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <form
      ref={formRef}
      className="mt-6 border rounded-lg p-4 space-y-3"
      method="post"
      action="/api/pins"
      onSubmit={() => {
        const form = formRef.current;
        if (!form) return;

        const titleEl = form.querySelector<HTMLInputElement>('input[name="title"]');
        const detailsEl = form.querySelector<HTMLTextAreaElement>('textarea[name="details"]');
        const contentEl = form.querySelector<HTMLInputElement>('input[name="content"]');

        const title = (titleEl?.value || "").trim();
        const details = (detailsEl?.value || "").trim();

        const combined = details ? `${title}\n\n${details}` : title;
        if (contentEl) contentEl.value = combined;
      }}
    >
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="content" value="" />

      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          name="event_date"
          type="date"
          className="mt-1 w-full border rounded px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Event title</label>
        <input
          name="title"
          type="text"
          className="mt-1 w-full border rounded px-3 py-2 text-sm"
          placeholder="e.g. Group camp"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Details (optional)</label>
        <textarea
          name="details"
          className="mt-1 w-full border rounded px-3 py-2 text-sm"
          rows={3}
          placeholder="Times, location, kit list link, etc."
        />
      </div>

      <button
        type="submit"
        className="inline-block bg-black text-white text-sm px-4 py-2 rounded"
      >
        Add event
      </button>
    </form>
  );
}
