"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { ToastBanner } from "@/components/admin/toast-banner";
import { authClient } from "@/lib/auth/auth-client";

export function AdminUserSignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email(
      {
        email,
        password,
        name: name || email,
      },
      {
        onRequest: () => {
          setError(null);
          setSuccess(null);
        },
        onError: (ctx) => {
          setError(ctx.error.message ?? "Unable to create user");
        },
        onSuccess: () => {
          setSuccess("User account created. The user can now sign in with their email and password.");
          setEmail("");
          setName("");
          setPassword("");
        },
      },
    );

    if (signUpError) {
      setError(signUpError.message ?? "Unable to create user");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Create user</h2>
        <p className="text-xs text-[var(--color-muted)]">
          New users receive no special permissions by default. You can promote them later via the
          CMS user role field.
        </p>
      </div>

      {error && <ToastBanner variant="error" title="User creation failed" message={error} />}
      {success && <ToastBanner variant="success" title="User created" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            placeholder="New User"
          />
        </div>

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

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Temporary password
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
          <p className="text-[0.7rem] text-[var(--color-muted)]">
            Ask the user to change this password after their first sign in.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)] disabled:opacity-60"
        >
          {loading ? "Creating user..." : "Create user"}
        </button>
      </form>
    </div>
  );
}
