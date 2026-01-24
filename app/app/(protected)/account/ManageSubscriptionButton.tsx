"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function onClick() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: "/app/account" }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Unable to open subscription management.");
        setLoading(false);
        return;
      }

      if (!data?.url) {
        setError("No portal URL returned.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">Subscription</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your plan, update payment method, or cancel your subscription.
          </p>
        </div>

        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-tint disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Opening…" : "Manage subscription"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
