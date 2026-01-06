"use client";
import { resendVerificationEmailAction } from "../../../(public)/login/actions";

export default function EmailVerificationNotice({
  email,
  error,
  message,
}: {
  email: string;
  error?: string;
  message?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
        
        <h2 className="text-xl font-semibold mb-2">Email Verification Required</h2>
        
        <p className="text-gray-600 mb-6">
          Please verify your email address before creating a pinboard.
        </p>

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

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            We sent a verification email to <strong>{email}</strong>
          </p>
          
          <form action={resendVerificationEmailAction}>
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Resend Verification Email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}



