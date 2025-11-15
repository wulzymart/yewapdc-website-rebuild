"use client";

import { useEffect } from "react";
import Link from "next/link";

import { ToastBanner } from "@/components/admin/toast-banner";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <ToastBanner
        variant="error"
        title="Something went wrong in the admin area."
        message={error.message || "An unexpected error occurred."}
        actions={
          <>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md bg-[var(--color-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--color-secondary-foreground)]"
            >
              Try again
            </button>
            <Link
              href="/admin"
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium"
            >
              Go to dashboard
            </Link>
          </>
        }
      />
      <p className="text-xs text-[var(--color-muted)]">
        If this keeps happening, please contact an administrator.
      </p>
    </div>
  );
}
