"use client";
import { resendVerificationEmailAction } from "../../(public)/login/actions";
import { useState } from "react";

export default function VerifyEmailClient({
  email,
  error,
  message,
}: {
  email: string;
  error?: string;
  message?: string;
}) {
  const [isResending, setIsResending] = useState(false);

  return (
    <div className="text-center">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold mb-4">Check your email</h1>

      <p className="text-muted-foreground mb-6">
        We've sent a verification email to <strong className="text-foreground">{email}</strong>. Click the link to verify your account.
      </p>

      <div className="bg-tint border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-foreground">
          <strong>Can't find it?</strong> Check your spam/junk folder.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{message}</p>
        </div>
      )}

      <form action={resendVerificationEmailAction}>
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={isResending}
          onClick={() => setIsResending(true)}
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-border">
        <a
          href="/app/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to sign in
        </a>
      </div>
    </div>
  );
}



