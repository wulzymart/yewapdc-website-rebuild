interface EditArticlePageProps {
  params: { id: string };
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Edit Article</h1>
      <p className="text-sm text-[var(--color-muted)]">
        Placeholder form for editing article with ID: <span className="font-mono">{params.id}</span>.
      </p>
    </section>
  );
}
