 import Link from "next/link";

import { AdminCalendarView } from "@/components/admin/calendar-view";
import { listEvents } from "@/lib/services/event-service";

export const revalidate = 60;

interface PublicEventsPageProps {
  searchParams: Promise<{
    q?: string;
    from?: string;
    to?: string;
    view?: string;
  }>;
}

function formatDate(value: Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PublicEventsPage({ searchParams }: PublicEventsPageProps) {
  const params = await searchParams;
  const search = (params?.q ?? "").trim();
  const fromParam = params?.from;
  const toParam = params?.to;
  const viewParam = params?.view;
  const view = viewParam === "calendar" ? "calendar" : "list";

  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(toParam) : undefined;

  const events = await listEvents({
    status: "PUBLISHED",
    search: search || undefined,
    from,
    to,
  });

  const sortedEvents = [...events].sort((a, b) => {
    const aTime = a.startDate ? a.startDate.getTime() : 0;
    const bTime = b.startDate ? b.startDate.getTime() : 0;
    return aTime - bTime;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Upcoming and recent events from the Yewa People&apos;s Development Council.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--color-muted)]">View:</span>
          <Link
            href="/events?view=list"
            className={`rounded px-2 py-1 border text-xs ${
              view === "list"
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "border-[var(--color-border)] hover:bg-[var(--color-muted)]/10"
            }`}
          >
            List
          </Link>
          <Link
            href="/events?view=calendar"
            className={`rounded px-2 py-1 border text-xs ${
              view === "calendar"
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                : "border-[var(--color-border)] hover:bg-[var(--color-muted)]/10"
            }`}
          >
            Calendar
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 text-sm" method="get">
        <input type="hidden" name="view" value={view} />
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={search}
            placeholder="Search by title, description, or location"
            className="h-9 w-64 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="from" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              From
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={fromParam ?? ""}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="to" className="text-xs font-medium text-[var(--color-muted-foreground)]">
              To
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={toParam ?? ""}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-md bg-[var(--color-secondary)] px-3 text-sm font-medium text-[var(--color-secondary-foreground)]"
          >
            Apply
          </button>
        </div>
      </form>

      {view === "list" ? (
        sortedEvents.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No events found for the selected filters.</p>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event) => {
              const startLabel = formatDate(event.startDate);
              const endLabel = formatDate(event.endDate);
              const sameDay = !endLabel || endLabel === startLabel;
              const dateLabel = sameDay ? startLabel : `${startLabel} · ${endLabel}`;

              return (
                <article
                  key={event.id}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm"
                >
                  <h2 className="text-base font-semibold leading-snug">
                    <Link href={`/events/${event.slug}`} className="hover:text-[var(--color-accent)]">
                      {event.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">{dateLabel}</p>
                  {event.location && (
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{event.location}</p>
                  )}
                  <p className="mt-2 line-clamp-3 text-xs text-[var(--color-muted-foreground)]">
                    {event.description}
                  </p>
                </article>
              );
            })}
          </div>
        )
      ) : (
        <AdminCalendarView
          events={sortedEvents.map((event) => ({
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
