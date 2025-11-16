import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { createArticleAction } from "@/app/admin/articles/actions";
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

export default async function NewArticlePage() {
  const { role } = await getCurrentUserWithRole();
  const isAuthor = role === "AUTHOR";
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">New Article</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Create a new article for the YEWAPDC website.
        </p>
      </div>

      <form
        action={createArticleAction}
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
          <label htmlFor="content" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="excerpt" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            placeholder="Short summary used in lists and previews (optional)"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
          />
        </div>

        {!isAuthor && (
          <div className="grid gap-4 sm:grid-cols-3">
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
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="publishedAt"
                className="text-xs font-medium text-[var(--color-muted-foreground)]"
              >
                Publish at
              </label>
              <input
                id="publishedAt"
                name="publishedAt"
                type="datetime-local"
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="scheduledAt"
                className="text-xs font-medium text-[var(--color-muted-foreground)]"
              >
                Scheduled for
              </label>
              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="seoTitle"
              className="text-xs font-medium text-[var(--color-muted-foreground)]"
            >
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
              Create article
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
