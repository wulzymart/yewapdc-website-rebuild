interface EditPromotionPageProps {
  params: { id: string };
}

export default function EditPromotionPage({ params }: EditPromotionPageProps) {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Edit Promotion</h1>
      <p className="text-sm text-[var(--color-muted)]">
        Placeholder form for editing promotion with ID: <span className="font-mono">{params.id}</span>.
      </p>
    </section>
  );
}
