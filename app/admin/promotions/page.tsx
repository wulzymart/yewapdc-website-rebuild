import Link from "next/link";

import { listPromotionsForAdmin } from "@/lib/services/promotion-service";

export default async function AdminPromotionsPage() {
  const promotions = await listPromotionsForAdmin();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Promotions</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage time-bound promotional content shown across the site.
          </p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
        >
          New promotion
        </Link>
      </div>

      {promotions.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No promotions found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Date range</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="border-t border-[var(--color-border)] text-xs">
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium text-[var(--color-foreground)]">{promotion.title}</div>
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--color-muted-foreground)]">
                    {promotion.position}
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                    {promotion.startDate?.toISOString?.().slice(0, 10) ?? ""} -
                    {" "}
                    {promotion.endDate?.toISOString?.().slice(0, 10) ?? ""}
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--color-muted)]">
                    {promotion.priority}
                  </td>
                  <td className="px-3 py-2 align-top">
                    {promotion.isActive ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.7rem] text-emerald-500">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.7rem] text-amber-500">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <Link
                      href={`/admin/promotions/${promotion.id}/edit`}
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
