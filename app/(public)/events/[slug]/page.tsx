import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getEventBySlug } from "@/lib/services/event-service";

export const revalidate = 60;

interface EventDetailPageProps {
  params: { slug: string };
}

function formatDateTime(value: Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: "Event not found | YEWAPDC",
    };
  }

  return {
    title: event.seoTitle || event.title,
    description: event.seoDescription || event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const startLabel = formatDateTime(event.startDate);
  const endLabel = formatDateTime(event.endDate);

  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Event</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {event.title}
        </h1>
        <p className="text-xs text-[var(--color-muted)]">
          {startLabel}
          {endLabel && endLabel !== startLabel ? ` · ${endLabel}` : ""}
        </p>
        {event.location && (
          <p className="text-sm text-[var(--color-muted)]">Location: {event.location}</p>
        )}
      </header>

      <section className="prose prose-sm max-w-none text-[var(--color-foreground)] prose-headings:text-[var(--color-foreground)] prose-p:text-[var(--color-foreground)]">
        <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
      </section>
    </article>
  );
}

