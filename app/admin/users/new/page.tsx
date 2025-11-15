import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { AdminUserSignupForm } from "@/components/auth/admin-user-signup-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canManageUsers, type UserRole } from "@/lib/auth/permissions";

export default async function AdminUserNewPage() {
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
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Invite user</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Create a new account for another team member. New users will be able to sign in with
          their email and password.
        </p>
      </div>
      <AdminUserSignupForm />
    </section>
  );
}
