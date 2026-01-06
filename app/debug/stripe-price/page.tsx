"use client";
import { useState } from "react";

export default function StripePriceTestPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function testPlan(plan: "monthly" | "yearly") {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, pinboardSlug: "stripe-test" }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to the checkout URL
        window.location.href = data.url;
      } else {
        // Display error
        setResult(JSON.stringify(data, null, 2));
        setLoading(false);
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Stripe Price Debug Test</h1>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <button
          onClick={() => testPlan("monthly")}
          disabled={loading}
          style={{ marginRight: "10px", padding: "8px 16px" }}
        >
          Test Monthly
        </button>
        <button
          onClick={() => testPlan("yearly")}
          disabled={loading}
          style={{ padding: "8px 16px" }}
        >
          Test Annual
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Response:</h2>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "10px",
              border: "1px solid #ddd",
              overflow: "auto",
            }}
          >
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}

