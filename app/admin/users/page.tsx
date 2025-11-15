import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canManageUsers, type UserRole } from "@/lib/auth/permissions";

export default async function AdminUsersIndexPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const allUsers = await db.select().from(users);
  const currentUser = allUsers.find((u) => u.id === session.user.id);
  const role = (currentUser?.role ?? "VIEWER") as UserRole;

  if (!currentUser || !canManageUsers(role)) {
    redirect("/admin");
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage accounts for people who can sign in to the YEWAPDC admin.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
        >
          New user
        </Link>
      </div>

      {allUsers.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} className="border-t border-[var(--color-border)] text-xs">
                  <td className="px-3 py-2 align-top">{user.name ?? user.email}</td>
                  <td className="px-3 py-2 align-top">{user.email}</td>
                  <td className="px-3 py-2 align-top">{user.role}</td>
                  <td className="px-3 py-2 align-top">
                    {user.emailVerified ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.7rem] text-emerald-500">
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.7rem] text-amber-500">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                    {user.createdAt?.toISOString?.().slice(0, 10) ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
