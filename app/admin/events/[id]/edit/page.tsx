interface EditEventPageProps {
  params: { id: string };
}

export default function EditEventPage({ params }: EditEventPageProps) {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Edit Event</h1>
      <p className="text-sm text-[var(--color-muted)]">
        Placeholder form for editing event with ID: <span className="font-mono">{params.id}</span>.
      </p>
    </section>
  );
}
