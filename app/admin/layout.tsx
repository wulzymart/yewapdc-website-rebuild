import type { ReactNode } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canManageUsers, canPublish, canViewAdmin, type UserRole } from "@/lib/auth/permissions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const allUsers = await db.select().from(users);
  const currentUser = allUsers.find((u) => u.id === session.user.id);
  const role = (currentUser?.role ?? "VIEWER") as UserRole;

  if (!currentUser || !canViewAdmin(role)) {
    redirect("/login");
  }

  const displayName = currentUser.name || currentUser.email || currentUser.id;
  const canSeeReviewQueue = canPublish(role);
  const canSeeUsers = canManageUsers(role);

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--color-background)] focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to main content
      </a>

      <aside className="hidden w-64 flex-col border-r border-[var(--color-accent-dark)] bg-[var(--color-background)]/70 p-4 md:flex">
        <div className="mb-4 space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">YEWAPDC Admin</h1>
          <p className="text-xs text-[var(--color-muted)]">Content management dashboard</p>
        </div>
        <AdminNav canSeeReviewQueue={canSeeReviewQueue} canSeeUsers={canSeeUsers} />
        <div className="pt-20">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--color-accent-dark)] bg-[var(--color-background)]/80 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">Admin</span>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">YEWAPDC CMS</span>
          </div>
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="w-full max-w-md rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/60 px-3 py-1.5 text-xs text-[var(--color-muted)]">
              <span>Search or jump to a section…</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <p className="font-medium text-[var(--color-foreground)]">{displayName}</p>
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">{role}</p>
            </div>
          </div>
        </header>

        <main id="admin-main-content" className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
