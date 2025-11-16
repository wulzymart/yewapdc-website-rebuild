import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { deleteEventAction, updateEventAction } from "@/app/admin/events/actions";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import type { UserRole } from "@/lib/auth/permissions";
import { getEventById } from "@/lib/services/event-service";

interface EditEventPageProps {
  params: { id: string };
}

function formatDateTimeLocal(value: Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

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

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { role } = await getCurrentUserWithRole();
  const isAuthor = role === "AUTHOR";

  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  const updateAction = updateEventAction.bind(null, event.id);
  const deleteAction = deleteEventAction.bind(null, event.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Edit Event</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Update the event details and schedule.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/events"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-muted)]/10"
          >
            Back to list
          </Link>
          <form action={deleteAction} method="post" className="inline-block">
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10"
            >
              Delete event
            </button>
          </form>
        </div>
      </div>

      <form
        action={updateAction}
        method="post"
        className="space-y-4 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm"
      >
        <div className="space-y-1">
          <label htmlFor="title" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={event.title}
            required
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="description"
            className="text-xs font-medium text-[var(--color-muted-foreground)]"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={event.description}
            rows={8}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="startDate" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              Start date &amp; time
            </label>
            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(event.startDate)}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="endDate" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              End date &amp; time
            </label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(event.endDate)}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>

          {!isAuthor && (
            <div className="space-y-1">
              <label htmlFor="status" className="text-xs font-medium text-[var(--color-muted-foreground)]">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={event.status}
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="location" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={event.location ?? ""}
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="seoTitle" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              SEO title
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              type="text"
              defaultValue={event.seoTitle ?? ""}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="seoDescription"
              className="text-xs font-medium text-[var(--color-muted-foreground)]"
            >
              SEO description
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              defaultValue={event.seoDescription ?? ""}
              rows={3}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {isAuthor ? (
            <>
              <button
                type="submit"
                name="intent"
                value="save"
                className="inline-flex items-center rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-muted)]/10"
              >
                Save draft
              </button>
              <button
                type="submit"
                name="intent"
                value="submit"
                className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
              >
                Submit for review
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
            >
              Save changes
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
