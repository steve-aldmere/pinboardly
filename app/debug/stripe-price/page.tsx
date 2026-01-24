"use client";

import { useState } from "react";

export default function StripePriceTestPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function testPlan(plan: "monthly" | "yearly") {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/stripe/debug-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
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
            className="bg-muted border border-border p-2.5 overflow-auto"
            style={{
              padding: "10px",
            }}
          >
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
