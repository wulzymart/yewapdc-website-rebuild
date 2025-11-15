interface EditPersonPageProps {
  params: { id: string };
}

export default function EditPersonPage({ params }: EditPersonPageProps) {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Edit Person</h1>
      <p className="text-sm text-[var(--color-muted)]">
        Placeholder form for editing person with ID: <span className="font-mono">{params.id}</span>.
      </p>
    </section>
  );
}
