import { ArticleCard } from "@/components/public/article-card";
import { listPublishedArticles } from "@/lib/services/article-service";

export const revalidate = 60;

interface PublicArticlesPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 10;

export default async function PublicArticlesPage({ searchParams }: PublicArticlesPageProps) {
  const params = await searchParams;
  const search = (params?.q ?? "").trim().toLowerCase();
  const pageParam = Number.parseInt(params?.page ?? "1", 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const allArticles = await listPublishedArticles();

  const filtered = search
    ? allArticles.filter((article) => {
        const haystack = [
          article.title,
          article.excerpt,
          article.seoTitle,
          article.seoDescription,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
    : allArticles;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
        <p className="text-sm text-[var(--color-muted)]">
          News articles and stories from the Yewa People&apos;s Development Council.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-2" method="get">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params?.q ?? ""}
            placeholder="Search by title or summary"
            className="h-9 w-64 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-[var(--color-secondary)] px-3 text-sm font-medium text-[var(--color-secondary-foreground)]"
        >
          Apply
        </button>
      </form>

      {pageItems.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No articles found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pageItems.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between pt-2 text-xs text-[var(--color-muted-foreground)]">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a
                href={`?page=${currentPage - 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className="rounded-md border border-[var(--color-border)] px-2 py-1 hover:bg-[var(--color-muted)]/10"
              >
                Previous
              </a>
            )}
            {currentPage < totalPages && (
              <a
                href={`?page=${currentPage + 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className="rounded-md border border-[var(--color-border)] px-2 py-1 hover:bg-[var(--color-muted)]/10"
              >
                Next
              </a>
            )}
          </div>
        </nav>
      )}
    </section>
  );
}
