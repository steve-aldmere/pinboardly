"use client";

import { useState } from "react";
import { signInAction, signUpAction, resetPasswordAction } from "./actions";

export default function LoginClient({
  error,
  message,
  next,
}: {
  error?: string;
  message?: string;
  next: string;
}) {
  const [mode, setMode] = useState<"signin" | "reset">("signin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/pinboardly-icon.svg"
            alt="Pinboardly"
            width={216}
            height={216}
            className="mb-3 h-[216px] w-[216px]"
          />
          <p className="mt-3 text-sm text-muted-foreground text-center">
            Sign in to manage your pinboards
          </p>
        </div>

        {mode === "signin" ? (
          <>
            {message ? (
              <div className="mb-4 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground text-center">
                {message}
              </div>
            ) : null}

            {error ? (
              <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
            ) : null}

            <form action={signInAction} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <input
                type="email"
                name="email"
                required
                placeholder="Email address"
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
              />
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary"
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => setMode("reset")}
                className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Forgot your password?
              </button>
            </form>

            <div className="mt-5 border-t pt-5">
              <form action={signUpAction} className="space-y-3">
                <input type="hidden" name="next" value={next} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="New email address"
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
                />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="New password"
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary"
                >
                  Create account
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  You'll need to verify your email before creating a pinboard.
                </p>
              </form>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-foreground text-center">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Enter your email and we’ll send you a reset link.
            </p>

            <form className="mt-6 space-y-4" action={resetPasswordAction}>
              <input type="hidden" name="next" value={next} />
              <input
                type="email"
                name="email"
                required
                placeholder="Email address"
                className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary"
              >
                Send reset link
              </button>

              <button
                type="button"
                onClick={() => setMode("signin")}
                className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
