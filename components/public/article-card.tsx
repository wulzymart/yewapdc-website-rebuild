import Link from "next/link";

import type { ArticleRecord } from "@/lib/services/article-service";

interface ArticleCardProps {
  article: ArticleRecord;
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

export function ArticleCard({ article }: ArticleCardProps) {
  const href = `/articles/${article.slug}`;
  const publishedLabel = formatDate(article.publishedAt ?? article.scheduledAt ?? null);

  return (
    <article className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm">
      <header className="space-y-1">
        <h2 className="text-base font-semibold leading-snug">
          <Link href={href} className="hover:text-[var(--color-accent)]">
            {article.title}
          </Link>
        </h2>
        {publishedLabel && (
          <p className="text-[0.75rem] uppercase tracking-wide text-[var(--color-muted)]">
            {publishedLabel}
          </p>
        )}
      </header>
      {article.excerpt && (
        <p className="text-xs text-[var(--color-muted)] line-clamp-3">{article.excerpt}</p>
      )}
    </article>
  );
}
