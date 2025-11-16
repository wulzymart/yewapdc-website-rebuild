import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canPublish, type UserRole } from "@/lib/auth/permissions";
import { listArticlesForAdmin } from "@/lib/services/article-service";
import { listEvents } from "@/lib/services/event-service";
import {
  approveArticleReviewAction,
  approveEventReviewAction,
  sendBackArticleForChangesAction,
  sendBackEventForChangesAction,
} from "./actions";

async function requireReviewer() {
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

  if (!canPublish(role)) {
    redirect("/admin");
  }

  return { user: currentUser, role };
}

export default async function AdminReviewPage() {
  await requireReviewer();

  const allArticles = await listArticlesForAdmin();
  const allEvents = await listEvents();

  const articlesInReview = allArticles.filter((article) => !article.deletedAt && article.workflowState === "IN_REVIEW");
  const eventsInReview = allEvents.filter((event) => !event.deletedAt && event.workflowState === "IN_REVIEW");

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Review queue</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Review content submitted by Authors and either mark it as reviewed or send it back for changes.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">Articles in review</h2>
        {articlesInReview.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No articles are currently awaiting review.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articlesInReview.map((article) => {
                  const approveAction = approveArticleReviewAction.bind(null, article.id);
                  const sendBackAction = sendBackArticleForChangesAction.bind(null, article.id);

                  return (
                    <tr key={article.id} className="border-t border-[var(--color-border)] text-xs">
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium text-[var(--color-foreground)]">{article.title}</div>
                        {article.excerpt && (
                          <div className="mt-0.5 line-clamp-2 text-[0.7rem] text-[var(--color-muted)]">{article.excerpt}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--color-muted-foreground)]">
                        {article.status} / {article.workflowState}
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                        {article.submittedForReviewAt?.toISOString?.().slice(0, 16) ?? ""}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-2 py-1 text-[0.7rem] hover:bg-[var(--color-muted)]/10"
                          >
                            Edit
                          </Link>
                          <form action={approveAction} method="post" className="inline-block">
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-2 py-1 text-[0.7rem] font-medium text-white hover:bg-[var(--color-accent-dark)]"
                            >
                              Mark reviewed
                            </button>
                          </form>
                          <form action={sendBackAction} method="post" className="inline-block">
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-md border border-red-500 px-2 py-1 text-[0.7rem] font-medium text-red-600 hover:bg-red-500/10"
                            >
                              Send back
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">Events in review</h2>
        {eventsInReview.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No events are currently awaiting review.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventsInReview.map((event) => {
                  const approveAction = approveEventReviewAction.bind(null, event.id);
                  const sendBackAction = sendBackEventForChangesAction.bind(null, event.id);

                  return (
                    <tr key={event.id} className="border-t border-[var(--color-border)] text-xs">
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium text-[var(--color-foreground)]">{event.title}</div>
                        {event.location && (
                          <div className="mt-0.5 text-[0.7rem] text-[var(--color-muted)]">{event.location}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--color-muted-foreground)]">
                        {event.status} / {event.workflowState}
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                        {event.submittedForReviewAt?.toISOString?.().slice(0, 16) ?? ""}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-2 py-1 text-[0.7rem] hover:bg-[var(--color-muted)]/10"
                          >
                            Edit
                          </Link>
                          <form action={approveAction} method="post" className="inline-block">
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-2 py-1 text-[0.7rem] font-medium text-white hover:bg-[var(--color-accent-dark)]"
                            >
                              Mark reviewed
                            </button>
                          </form>
                          <form action={sendBackAction} method="post" className="inline-block">
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-md border border-red-500 px-2 py-1 text-[0.7rem] font-medium text-red-600 hover:bg-red-500/10"
                            >
                              Send back
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
