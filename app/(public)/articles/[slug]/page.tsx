interface ArticleDetailPageProps {
  params: { slug: string };
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  return (
    <article className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Article: <span className="font-mono text-base">{params.slug}</span>
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        Placeholder for article detail view.
      </p>
    </article>
  );
}
