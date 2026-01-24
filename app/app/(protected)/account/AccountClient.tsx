"use client";
import { useState } from "react";
import { updatePasswordAction } from "./actions";

export default function AccountClient({
  email,
  isEmailVerified,
  error,
  success,
}: {
  email: string;
  isEmailVerified: boolean;
  error?: string;
  success?: string;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="space-y-8">
      {/* User Information Section */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <p className="mt-1 text-sm text-foreground">{email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Email Verification Status</label>
            <div className="mt-1 flex items-center gap-2">
              {isEmailVerified ? (
                <>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Unverified
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <form action={updatePasswordAction} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Must be at least 6 characters.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tint"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



