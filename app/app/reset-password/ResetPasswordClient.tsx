"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordClient() {
  const supabase = createSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setStatus("idle");
      setError(updateError.message);
      return;
    }

    setStatus("saved");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-semibold text-gray-900 text-center">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Set a new password for your account.
        </p>

        {error ? (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        ) : null}

        {status === "saved" ? (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            Password updated. You can now{" "}
            <Link
              href="/app/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              sign in
            </Link>
            .
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {status === "saving" ? "Saving..." : "Update password"}
            </button>

            <Link
              href="/app/login"
              className="block w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
