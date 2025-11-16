"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ToastBanner } from "@/components/admin/toast-banner";
import { authClient } from "@/lib/auth/auth-client";

function isForbiddenError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: number };
  return candidate.status === 403;
}

function getErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { message?: string };
  return candidate.message;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/admin",
        rememberMe: true,
      },
      {
        onRequest: () => {
          setError(null);
        },
        onError: (ctx) => {
          if (isForbiddenError(ctx.error)) {
            setError("Please verify your email address. We just sent you a verification link.");
          } else {
            setError(getErrorMessage(ctx.error) ?? "Invalid email or password");
          }
        },
        onSuccess: () => {
          router.push("/admin");
        },
      },
    );

    if (signInError) {
      if (isForbiddenError(signInError)) {
        setError("Please verify your email address. We just sent you a verification link.");
      } else {
        setError(getErrorMessage(signInError) ?? "Invalid email or password");
      }
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold tracking-tight">YEWAPDC Admin Login</h1>
        <p className="text-xs text-[var(--color-muted)]">Sign in with your admin email and password.</p>
      </div>

      {error && <ToastBanner variant="error" title="Login failed" message={error} />}

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

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-[0.7rem] text-[var(--color-muted)] underline">
            Forgot your password?
          </Link>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
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
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {process.env.NODE_ENV === "development" && (
        <p className="text-center text-[0.7rem] text-[var(--color-muted)]">
          Dev only: need an account?{" "}
          <Link href="/dev-signup" className="underline">
            Create one here
          </Link>
          .
        </p>
      )}
    </div>
  );
}
