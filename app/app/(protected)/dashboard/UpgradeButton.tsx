"use client";
import { useState } from "react";

export default function UpgradeButton({
  slug,
  title,
  ownerUserId,
  customerEmail,
}: {
  slug: string;
  title: string;
  ownerUserId: string;
  customerEmail: string | null;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: "yearly", // Default to yearly for upgrades
          pinboardSlug: slug,
          ownerUserId,
          title,
          customerEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to create checkout session. Please try again.");
        setLoading(false);
        return;
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
        return;
      }

      alert("Failed to create checkout session. Please try again.");
      setLoading(false);
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="text-sm text-primary hover:text-primary disabled:text-muted-foreground"
    >
      {loading ? "Loading..." : "Upgrade"}
    </button>
  );
}
