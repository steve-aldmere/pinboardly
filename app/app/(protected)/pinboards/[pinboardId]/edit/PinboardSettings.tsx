"use client";
import { useState, useEffect } from "react";
import { updatePinboardTitleAction, removePinboardAction } from "./actions";

export default function PinboardSettings({
  pinboardId,
  initialTitle,
  status,
  trialEndsAt,
  paidUntil,
}: {
  pinboardId: string;
  initialTitle: string;
  status: string;
  trialEndsAt: string | null;
  paidUntil: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for success message in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      setShowSuccess(true);
      setIsEditing(false);
      // Clean up URL after showing success
      setTimeout(() => {
        setShowSuccess(false);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }, 3000);
    }
  }, []);

  // Update title when initialTitle changes (after server action redirect)
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  return (
    <div className="bg-white rounded-lg border border-border p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Pinboard Settings</h2>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-sm text-primary hover:text-primary"
              >
                Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <form action={updatePinboardTitleAction} className="space-y-3">
              <input type="hidden" name="pinboardId" value={pinboardId} />
              <input
                type="text"
                name="title"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(initialTitle);
                  }}
                  className="px-4 py-2 bg-muted text-muted-foreground text-sm rounded-lg hover:bg-tint"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-sm text-foreground font-medium">{title}</p>
              {showSuccess && (
                <p className="text-sm text-green-600 mt-2">Title updated successfully!</p>
              )}
            </>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span>{" "}
            <span className="font-medium">{status}</span>
          </div>
          {trialEndsAt && (
            <div>
              <span className="text-muted-foreground">Trial ends:</span>{" "}
              <span>{new Date(trialEndsAt).toLocaleDateString()}</span>
            </div>
          )}
          {paidUntil && (
            <div>
              <span className="text-muted-foreground">Paid until:</span>{" "}
              <span>{new Date(paidUntil).toLocaleDateString("en-GB", { timeZone: "UTC" })}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <form action={removePinboardAction}>
            <input type="hidden" name="pinboardId" value={pinboardId} />
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-700"
              onClick={(e) => {
                if (
                  !confirm(
                    "Remove this pinboard? It will be taken offline but you can restore it within 30 days."
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              Remove pinboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

