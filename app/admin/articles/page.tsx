import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { listArticlesForAdmin } from "@/lib/services/article-service";
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

interface AdminArticlesPageProps {
  searchParams?: {
    q?: string;
    status?: string;
  };
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const { user, role } = await getCurrentUserWithRole();

  const search = typeof searchParams?.q === "string" ? searchParams.q : "";
  const statusParam = searchParams?.status;
  const status =
    statusParam === "DRAFT" || statusParam === "PUBLISHED" || statusParam === "SCHEDULED"
      ? statusParam
      : undefined;

  const articles = await listArticlesForAdmin({
    search: search || undefined,
    status,
    authorId: role === "AUTHOR" ? user.id : undefined,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Articles</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage news articles and blog posts for the public site.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
        >
          New article
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-col gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
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
            placeholder="Search by title or description"
            className="mt-1 h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
          />
        </div>
        <div className="flex items-end gap-2">
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
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-8 items-center rounded-md bg-[var(--color-accent)] px-3 text-xs font-medium text-white shadow-sm hover:bg-[var(--color-accent-dark)]"
          >
            Apply
          </button>
        </div>
      </form>

      {articles.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No articles found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-t border-[var(--color-border)] text-xs">
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium text-[var(--color-foreground)]">{article.title}</div>
                    {article.excerpt && (
                      <div className="mt-0.5 line-clamp-2 text-[0.7rem] text-[var(--color-muted)]">
                        {article.excerpt}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--color-muted-foreground)]">
                    {article.status}
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                    {article.publishedAt?.toISOString?.().slice(0, 10) ?? "	"}
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                    {article.updatedAt?.toISOString?.().slice(0, 10) ?? ""}
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
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
    </section>
  );
}
