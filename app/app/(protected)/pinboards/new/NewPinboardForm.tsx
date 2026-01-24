"use client";

import { useEffect, useState } from "react";
import { createPinboardAction } from "./actions";

export default function NewPinboardForm({
  isAdmin,
  error: errorProp,
}: {
  isAdmin: boolean;
  error?: string;
}) {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [error, setError] = useState(errorProp || "");

  useEffect(() => {
    if (errorProp) setError(errorProp);
  }, [errorProp]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
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
        <div className="rounded-lg bg-tint border border-border p-4">
          <p className="text-sm text-primary">
            ✓ Admin mode: Your pinboards will be automatically activated without
            payment.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground mb-2"
        >
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
          className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This is the display name (you can change it later).
        </p>
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Web Address (Slug)
        </label>

        {/* Fix overflow on small screens: allow input to shrink */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-muted-foreground shrink-0">
            pinboardly.com/
          </span>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={handleSlugChange}
            placeholder="tynemouth-scouts"
            className="flex-1 min-w-0 rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
          />
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Lowercase letters, numbers, and dashes only. Cannot be changed later.
        </p>

        {slug && (
          <p className="mt-2 text-sm text-foreground break-all">
            Your pinboard will be at:{" "}
            <strong>pinboardly.com/{slug}</strong>
          </p>
        )}
      </div>

      {!isAdmin && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subscription Plan
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  name="plan"
                  value="yearly"
                  checked={plan === "yearly"}
                  onChange={(e) => setPlan(e.target.value as "yearly")}
                  className="text-primary focus:ring-tint"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Yearly</div>
                  <div className="text-xs text-muted-foreground">£79/year</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted">
                <input
                  type="radio"
                  name="plan"
                  value="monthly"
                  checked={plan === "monthly"}
                  onChange={(e) => setPlan(e.target.value as "monthly")}
                  className="text-primary focus:ring-tint"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Monthly</div>
                  <div className="text-xs text-muted-foreground">£9/month</div>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <p className="text-sm text-foreground">
              You’ll be taken to secure checkout to confirm your subscription. A
              card is collected so your pinboard can renew automatically, and
              you can cancel any time before renewal.
            </p>
          </div>
        </>
      )}

      <div className="pt-4 border-t">
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary"
        >
          {isAdmin ? "Create Pinboard" : "Continue to Payment"}
        </button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {isAdmin ? (
          <p>Admin pinboards are automatically activated.</p>
        ) : (
          <p>
            Payment is required to create a pinboard. Your pinboard will be
            activated after payment.
          </p>
        )}
      </div>
    </form>
  );
}
