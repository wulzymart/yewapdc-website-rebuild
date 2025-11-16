import { createPromotionAction } from "@/app/admin/promotions/actions";

export default function NewPromotionPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">New Promotion</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Create a new time-bound promotion.
        </p>
      </div>

      <form
        action={createPromotionAction}
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
          <div className="space-y-1">
            <label htmlFor="position" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              Position
            </label>
            <select
              id="position"
              name="position"
              defaultValue="HERO"
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
              defaultValue={0}
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
              placeholder="Optional button text"
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
              placeholder="Optional link URL"
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
            placeholder="Optional media ID for image or asset"
            className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
          >
            Create promotion
          </button>
        </div>
      </form>
    </section>
  );
}
