import { headers } from "next/headers";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import type { UserRole } from "@/lib/auth/permissions";
import { buildDashboardSummary } from "@/lib/services/dashboard-service";
import { DashboardMetrics } from "@/components/admin/dashboard-metrics";
import { DashboardActivity } from "@/components/admin/dashboard-activity";
import { DashboardChart } from "@/components/admin/dashboard-chart";
import { DashboardSchedule } from "@/components/admin/dashboard-schedule";

async function getCurrentUserWithRole() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Missing admin session");
  }

  const allUsers = await db.select().from(users);
  const currentUser = allUsers.find((u) => u.id === session.user.id);
  const role = (currentUser?.role ?? "VIEWER") as UserRole;

  if (!currentUser) {
    throw new Error("Current user not found");
  }

  return { user: currentUser, role };
}

export default async function AdminDashboardPage() {
  const { user, role } = await getCurrentUserWithRole();
  const summary = await buildDashboardSummary({ role, userId: user.id });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Overview of recent activity and key metrics for the YEWAPDC site.
        </p>
      </header>

      <div className="space-y-6">
        <DashboardMetrics metrics={summary.metrics} />

        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <DashboardChart series={summary.articlesChart} />
            <DashboardSchedule items={summary.upcoming} />
          </div>
          <div className="flex flex-col gap-8">
            <h2 className="text-sm font-medium tracking-tight text-[var(--color-foreground)] ml-4">
              Recent activities
            </h2>
            <DashboardActivity activity={summary.activity} />
          </div>
        </div>
      </div>
    </section>
  );
}
