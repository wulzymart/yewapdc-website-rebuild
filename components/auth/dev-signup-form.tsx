"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ToastBanner } from "@/components/admin/toast-banner";
import { authClient } from "@/lib/auth/auth-client";

export function DevSignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email(
      {
        email,
        password,
        name: name || email,
        callbackURL: "/admin",
      },
      {
        onRequest: () => {
          setError(null);
        },
        onError: (ctx) => {
          setError(ctx.error.message ?? "Unable to create account");
        },
        onSuccess: () => {
          router.push("/admin");
        },
      },
    );

    if (signUpError) {
      setError(signUpError.message ?? "Unable to create account");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold tracking-tight">Dev Signup (Local Only)</h1>
        <p className="text-xs text-[var(--color-muted)]">
          Create an admin-capable account for local development. Disable or remove this page in production.
        </p>
      </div>

      {error && <ToastBanner variant="error" title="Sign-up failed" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            placeholder="Admin User"
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
            Password
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

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)] disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create dev account"}
        </button>
      </form>
    </div>
  );
}
