import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getArticleBySlug } from "@/lib/services/article-service";

export const revalidate = 60;

interface ArticleDetailPageProps {
  params: { slug: string };
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

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Article not found | YEWAPDC",
    };
  }

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const publishedLabel = formatDate(article.publishedAt ?? article.scheduledAt ?? null);

  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Article</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {article.title}
        </h1>
        {publishedLabel && (
          <p className="text-xs text-[var(--color-muted)]">Published {publishedLabel}</p>
        )}
        {article.excerpt && (
          <p className="text-sm text-[var(--color-muted)]">{article.excerpt}</p>
        )}
      </header>

      <section className="prose prose-sm max-w-none text-[var(--color-foreground)] prose-headings:text-[var(--color-foreground)] prose-p:text-[var(--color-foreground)]">
        <p className="whitespace-pre-wrap leading-relaxed">{article.content}</p>
      </section>
    </article>
  );
}
