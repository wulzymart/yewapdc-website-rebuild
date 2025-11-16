import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createEventAction } from "@/app/admin/events/actions";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
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

export default async function NewEventPage() {
  const { role } = await getCurrentUserWithRole();
  const isAuthor = role === "AUTHOR";
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">New Event</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Create a new event for the YEWAPDC website.
        </p>
      </div>

      <form
        action={createEventAction}
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
            required
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
              required
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
              required
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
                defaultValue="DRAFT"
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
            placeholder="Optional venue or address"
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
              placeholder="Optional title for search engines"
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
              rows={3}
              placeholder="Optional description for search engines"
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
              Create event
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
