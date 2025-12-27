// app/login/LoginClient.tsx
"use client";

import Image from "next/image";
import { signInAction, signUpAction } from "./actions";

export default function LoginClient({
  error,
  next,
}: {
  error?: string;
  next: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/pinboardly-icon.svg"
            alt="Pinboardly"
            width={72}
            height={72}
            priority
            className="mb-3"
          />
          <p className="mt-3 text-sm text-gray-600 text-center">
            Sign in to manage your organisation and boards
          </p>
        </div>

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
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign in
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              name="password"
              required
              placeholder="New password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Create account
            </button>

            <p className="text-xs text-gray-500 text-center">
              If email confirmation is enabled, you’ll need to confirm then sign
              in.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
