"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { ToastBanner } from "@/components/admin/toast-banner";
import { authClient } from "@/lib/auth/auth-client";

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    if (!password || password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (resetError) {
      setError(resetError.message ?? "Unable to reset password");
      setLoading(false);
      return;
    }

    setSuccess("Your password has been reset. You can now sign in with your new password.");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold tracking-tight">Choose a new password</h1>
        <p className="text-xs text-[var(--color-muted)]">
          Enter and confirm your new password.
        </p>
      </div>

      {error && <ToastBanner variant="error" title="Reset failed" message={error} />}
      {success && <ToastBanner variant="success" title="Password updated" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-[var(--color-muted-foreground)]"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)] disabled:opacity-60"
        >
          {loading ? "Updating password..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
