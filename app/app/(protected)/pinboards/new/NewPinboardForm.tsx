"use client";
import { useState, useEffect } from "react";
import { createPinboardAction } from "./actions";

export default function NewPinboardForm({ 
  isAdmin,
  error: errorProp 
}: { 
  isAdmin: boolean;
  error?: string;
}) {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState(errorProp || "");
  
  // Update error when prop changes (from URL params)
  useEffect(() => {
    if (errorProp) {
      setError(errorProp);
    }
  }, [errorProp]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Auto-format: lowercase, only letters/numbers/dashes
    let value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .substring(0, 40);
    
    setSlug(value);
  }

  return (
    <form action={createPinboardAction} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isAdmin && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-600">
            ✓ Admin mode: Your pinboards will be automatically activated without payment.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Pinboard Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Tynemouth Sea Scouts"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          This is the display name (you can change it later)
        </p>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          Web Address (Slug)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">pinboardly.com/</span>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={handleSlugChange}
            placeholder="tynemouth-scouts"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Lowercase letters, numbers, and dashes only. Cannot be changed later.
        </p>
        {slug && (
          <p className="mt-2 text-sm text-gray-700">
            Your pinboard will be at: <strong>pinboardly.com/{slug}</strong>
          </p>
        )}
      </div>

      <div className="pt-4 border-t">
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Pinboard
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        {isAdmin ? (
          <p>Admin pinboards are automatically activated.</p>
        ) : (
          <p>You'll get a 7-day free trial. After that, it's £59.88/year to keep it live.</p>
        )}
      </div>
    </form>
  );
}