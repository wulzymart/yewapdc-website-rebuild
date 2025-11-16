import type { ReactNode } from "react";

import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { LogoutButton } from "@/components/admin/logout-button";
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

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--color-background)] focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to main content
      </a>
      <aside className="w-64 border-r border-[var(--color-accent-dark)] p-4 space-y-4 bg-[var(--color-background)]/60">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">YEWAPDC Admin</h1>
          <p className="text-xs text-[var(--color-muted)]">Content management dashboard</p>
        </div>
        <nav className="space-y-1 text-sm" aria-label="Admin navigation">
          <Link href="/admin" className="block hover:text-[var(--color-accent)]">
            Dashboard
          </Link>
          <Link href="/admin/articles" className="block hover:text-[var(--color-accent)]">
            Articles
          </Link>
          <Link href="/admin/events" className="block hover:text-[var(--color-accent)]">
            Events
          </Link>
          <Link href="/admin/promotions" className="block hover:text-[var(--color-accent)]">
            Promotions
          </Link>
          {canPublish(role) && (
            <Link href="/admin/review" className="block hover:text-[var(--color-accent)]">
              Review queue
            </Link>
          )}
          <Link href="/admin/media" className="block hover:text-[var(--color-accent)]">
            Media library
          </Link>
          <Link href="/admin/persons" className="block hover:text-[var(--color-accent)]">
            Persons & offices
          </Link>
          <Link href="/admin/settings" className="block hover:text-[var(--color-accent)]">
            Site settings
          </Link>
          {canManageUsers(role) && (
            <Link href="/admin/users" className="block hover:text-[var(--color-accent)]">
              Users
            </Link>
          )}
        </nav>
        <LogoutButton />
      </aside>
      <main id="admin-main-content" className="flex-1 p-6">{children}</main>
    </div>
  );
}
