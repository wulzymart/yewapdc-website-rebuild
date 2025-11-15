import type { ReactNode } from "react";

import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { LogoutButton } from "@/components/admin/logout-button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canManageUsers, canViewAdmin, type UserRole } from "@/lib/auth/permissions";

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
      <aside className="w-64 border-r border-[var(--color-accent-dark)] p-4 space-y-4 bg-[var(--color-background)]/60">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">YEWAPDC Admin</h1>
          <p className="text-xs text-[var(--color-muted)]">Content management dashboard</p>
        </div>
        <nav className="space-y-1 text-sm">
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
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
