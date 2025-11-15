interface EventDetailPageProps {
  params: { slug: string };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  return (
    <article className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Event: <span className="font-mono text-base">{params.slug}</span>
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        Placeholder for event detail view.
      </p>
    </article>
  );
}
