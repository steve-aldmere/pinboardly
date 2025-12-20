"use client";

import { useState } from "react";
import { signInAction } from "./actions";

export default function LoginClient({ error }: { error?: string }) {
  const [pending, setPending] = useState(false);

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Sign in</h1>

      {error ? (
        <div style={{ marginBottom: 12, padding: 12, border: "1px solid #f5c2c7" }}>
          {error}
        </div>
      ) : null}

      <form
        action={async (formData) => {
          setPending(true);
          await signInAction(formData);
        }}
        style={{ display: "grid", gap: 12 }}
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          style={{ padding: 10, fontSize: 16 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          style={{ padding: 10, fontSize: 16 }}
        />

        <button type="submit" disabled={pending} style={{ padding: 10, fontSize: 16 }}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
