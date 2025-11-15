"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { ToastBanner } from "@/components/admin/toast-banner";
import { authClient } from "@/lib/auth/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (requestError) {
      setError(requestError.message ?? "Unable to send reset link");
      setLoading(false);
      return;
    }

    setSuccess("If an account exists for this email, a reset link has been sent.");
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold tracking-tight">Reset your password</h1>
        <p className="text-xs text-[var(--color-muted)]">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      {error && <ToastBanner variant="error" title="Request failed" message={error} />}      
      {success && <ToastBanner variant="success" title="Email sent" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)] disabled:opacity-60"
        >
          {loading ? "Sending link..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
