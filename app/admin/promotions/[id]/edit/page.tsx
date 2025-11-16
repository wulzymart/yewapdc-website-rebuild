import Link from "next/link";
import { notFound } from "next/navigation";

import { deletePromotionAction, updatePromotionAction } from "@/app/admin/promotions/actions";
import { getPromotionById } from "@/lib/services/promotion-service";

interface EditPromotionPageProps {
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

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  const promotion = await getPromotionById(params.id);

  if (!promotion) {
    notFound();
  }

  const updateAction = updatePromotionAction.bind(null, promotion.id);
  const deleteAction = deletePromotionAction.bind(null, promotion.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Edit Promotion</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Update the promotion content, timing, and placement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/promotions"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-muted)]/10"
          >
            Back to list
          </Link>
          <form action={deleteAction} method="post" className="inline-block">
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10"
            >
              Delete promotion
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
            defaultValue={promotion.title}
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
            defaultValue={promotion.content}
            rows={5}
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
              defaultValue={formatDateTimeLocal(promotion.startDate)}
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
              defaultValue={formatDateTimeLocal(promotion.endDate)}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="position" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              Position
            </label>
            <select
              id="position"
              name="position"
              defaultValue={promotion.position}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            >
              <option value="HERO">Hero</option>
              <option value="SIDEBAR">Sidebar</option>
              <option value="FOOTER">Footer</option>
              <option value="BANNER">Banner</option>
              <option value="POPUP">Popup</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="priority" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              Priority
            </label>
            <input
              id="priority"
              name="priority"
              type="number"
              defaultValue={promotion.priority ?? 0}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="ctaText" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              CTA text
            </label>
            <input
              id="ctaText"
              name="ctaText"
              type="text"
              defaultValue={promotion.ctaText ?? ""}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="ctaLink" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              CTA link
            </label>
            <input
              id="ctaLink"
              name="ctaLink"
              type="url"
              defaultValue={promotion.ctaLink ?? ""}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="mediaId" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Media ID
          </label>
          <input
            id="mediaId"
            name="mediaId"
            type="text"
            defaultValue={promotion.mediaId ?? ""}
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={promotion.isActive}
            className="h-3 w-3 rounded border border-[var(--color-border)]"
          />
          <label htmlFor="isActive" className="text-xs text-[var(--color-muted-foreground)]">
            Promotion is active
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
          >
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}
