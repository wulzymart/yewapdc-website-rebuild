import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminCalendarView } from "@/components/admin/calendar-view";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { listEvents } from "@/lib/services/event-service";
import type { UserRole } from "@/lib/auth/permissions";

async function getCurrentUserWithRole() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const allUsers = await db.select().from(users);
  const currentUser = allUsers.find((u) => u.id === session.user.id);
  const role = (currentUser?.role ?? "VIEWER") as UserRole;

  if (!currentUser) {
    redirect("/login");
  }

  return { user: currentUser, role };
}

interface AdminEventsPageProps {
  searchParams?: {
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    view?: string;
  };
}

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  const { user, role } = await getCurrentUserWithRole();

  const search = typeof searchParams?.q === "string" ? searchParams.q : "";
  const statusParam = searchParams?.status;
  const status = statusParam === "DRAFT" || statusParam === "PUBLISHED" ? statusParam : undefined;

  const fromParam = searchParams?.from;
  const toParam = searchParams?.to;

  const viewParam = searchParams?.view;
  const view = viewParam === "calendar" ? "calendar" : "list";

  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(toParam) : undefined;

  const events = await listEvents({
    search: search || undefined,
    status,
    from,
    to,
    createdBy: role === "AUTHOR" ? user.id : undefined,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage informational events and their schedule.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-1 text-[0.7rem]">
            <span className="px-2 text-[var(--color-muted)]">View:</span>
            <Link
              href="/admin/events?view=list"
              className={`rounded px-2 py-1 ${view === "list" ? "bg-[var(--color-accent)] text-white" : "hover:bg-[var(--color-muted)]/10"}`}
            >
              List
            </Link>
            <Link
              href="/admin/events?view=calendar"
              className={`rounded px-2 py-1 ${view === "calendar" ? "bg-[var(--color-accent)] text-white" : "hover:bg-[var(--color-muted)]/10"}`}
            >
              Calendar
            </Link>
          </div>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
          >
            New event
          </Link>
        </div>
      </div>

      {view === "list" ? (
        <>
          <form
            method="get"
            className="flex flex-col gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-muted-foreground)]" htmlFor="q">
                Search
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={search}
                placeholder="Search by title, description, or location"
                className="mt-1 h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label
                  className="block text-xs font-medium text-[var(--color-muted-foreground)]"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={status ?? ""}
                  className="mt-1 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
                >
                  <option value="">All</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-[var(--color-muted-foreground)]"
                  htmlFor="from"
                >
                  From
                </label>
                <input
                  id="from"
                  name="from"
                  type="date"
                  defaultValue={fromParam ?? ""}
                  className="mt-1 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-[var(--color-muted-foreground)]"
                  htmlFor="to"
                >
                  To
                </label>
                <input
                  id="to"
                  name="to"
                  type="date"
                  defaultValue={toParam ?? ""}
                  className="mt-1 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-md bg-[var(--color-accent)] px-3 text-xs font-medium text-white shadow-sm hover:bg-[var(--color-accent-dark)]"
              >
                Apply
              </button>
            </div>
          </form>

          {events.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No events found.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Dates</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-t border-[var(--color-border)] text-xs">
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium text-[var(--color-foreground)]">{event.title}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                        {event.startDate?.toISOString?.().slice(0, 10) ?? ""}
                        {" "}
                        - {event.endDate?.toISOString?.().slice(0, 10) ?? ""}
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--color-muted-foreground)]">
                        {event.status}
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                        {event.location ?? ""}
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="inline-flex items-center rounded-md border border-[var(--color-border)] px-2 py-1 text-[0.7rem] hover:bg-[var(--color-muted)]/10"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <AdminCalendarView
          events={events.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.startDate ?? event.endDate ?? new Date(),
            end: event.endDate ?? event.startDate ?? new Date(),
          }))}
        />
      )}
    </section>
  );
}
