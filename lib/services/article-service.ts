import { db, pool } from "@/lib/db/drizzle";
import { articles, articleStatusEnum, workflowStateEnum } from "@/db/schema";

export type ArticleRecord = typeof articles.$inferSelect;
export type ArticleStatus = (typeof articleStatusEnum.enumValues)[number];
export type ArticleWorkflowState = (typeof workflowStateEnum.enumValues)[number];

export interface CreateArticleInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string | null;
  featuredImageId?: string | null;
  status?: ArticleStatus;
  categoryId?: string | null;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
  ogImageId?: string | null;
  authorId: string;
  createdBy?: string | null;
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string | null;
  content?: string;
  excerpt?: string | null;
  featuredImageId?: string | null;
  status?: ArticleStatus;
  categoryId?: string | null;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
  ogImageId?: string | null;
  updatedBy?: string | null;
}

export interface ListArticlesFilter {
  status?: ArticleStatus;
  categoryId?: string | null;
  search?: string;
  authorId?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generateUniqueSlug(baseTitle: string, existingId?: string): Promise<string> {
  const base = slugify(baseTitle) || "article";
  const rows = await db.select().from(articles);
  const taken = new Set(
    rows
      .filter((row) => row.id !== existingId)
      .map((row) => row.slug.toLowerCase()),
  );

  let candidate = base;
  let i = 1;
  while (taken.has(candidate.toLowerCase())) {
    candidate = `${base}-${i++}`;
  }

  return candidate;
}

function resolveStatusAndTimestamps(
  status: ArticleStatus,
  publishedAt?: Date | null,
  scheduledAt?: Date | null,
): { status: ArticleStatus; publishedAt: Date | null; scheduledAt: Date | null } {
  if (status === "SCHEDULED") {
    if (!scheduledAt) {
      throw new Error("scheduledAt is required when status is SCHEDULED");
    }
    return { status, publishedAt: null, scheduledAt };
  }

  if (status === "PUBLISHED") {
    return { status, publishedAt: publishedAt ?? new Date(), scheduledAt: null };
  }

  return { status: "DRAFT", publishedAt: null, scheduledAt: null };
}

export async function createArticle(input: CreateArticleInput): Promise<ArticleRecord> {
  const status: ArticleStatus = input.status ?? "DRAFT";
  const { publishedAt, scheduledAt } = input;
  const normalized = resolveStatusAndTimestamps(status, publishedAt ?? null, scheduledAt ?? null);

  const slug = await generateUniqueSlug(input.slug ?? input.title);

  const [created] = await db
    .insert(articles)
    .values({
      title: input.title,
      slug,
      content: input.content,
      excerpt: input.excerpt ?? null,
      featuredImageId: input.featuredImageId ?? null,
      status: normalized.status,
      categoryId: input.categoryId ?? null,
      publishedAt: normalized.publishedAt,
      scheduledAt: normalized.scheduledAt,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoKeywords: input.seoKeywords ?? null,
      ogImageId: input.ogImageId ?? null,
      authorId: input.authorId,
      createdBy: input.createdBy ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create article");
  }

  return created;
}

export async function getArticleById(id: string): Promise<ArticleRecord | null> {
  const rows = await db.select().from(articles);
  const row = rows.find((item) => item.id === id && !item.deletedAt);
  return row ?? null;
}

export async function getArticleBySlug(slug: string): Promise<ArticleRecord | null> {
  const rows = await db.select().from(articles);
  const row = rows.find((item) => item.slug === slug && !item.deletedAt && item.status === "PUBLISHED");
  return row ?? null;
}

export async function listArticlesForAdmin(filter: ListArticlesFilter = {}): Promise<ArticleRecord[]> {
  const rows = await db.select().from(articles);
  const term = filter.search?.trim().toLowerCase() ?? "";

  return rows.filter((row) => {
    if (row.deletedAt) return false;
    if (filter.authorId && row.authorId !== filter.authorId) return false;
    if (filter.status && row.status !== filter.status) return false;
    if (filter.categoryId !== undefined) {
      if (filter.categoryId === null ? row.categoryId !== null : row.categoryId !== filter.categoryId) {
        return false;
      }
    }
    if (term) {
      const haystack = [row.title, row.excerpt, row.seoTitle, row.seoDescription]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

export async function listPublishedArticles(): Promise<ArticleRecord[]> {
  const rows = await db.select().from(articles);
  const now = new Date();

  return rows.filter((row) => {
    if (row.deletedAt) return false;
    if (row.status === "PUBLISHED") {
      return row.publishedAt ? row.publishedAt <= now : true;
    }
    if (row.status === "SCHEDULED") {
      return row.scheduledAt !== null && row.scheduledAt <= now;
    }
    return false;
  });
}

export async function updateArticle(id: string, input: UpdateArticleInput): Promise<ArticleRecord> {
  const existing = await getArticleById(id);
  if (!existing) {
    throw new Error("Article not found");
  }

  const next: Partial<ArticleRecord> = {};

  if (input.title !== undefined) {
    next.title = input.title;
  }
  if (input.content !== undefined) {
    next.content = input.content;
  }
  if (input.excerpt !== undefined) {
    next.excerpt = input.excerpt;
  }
  if (input.featuredImageId !== undefined) {
    next.featuredImageId = input.featuredImageId;
  }
  if (input.categoryId !== undefined) {
    next.categoryId = input.categoryId;
  }
  if (input.seoTitle !== undefined) {
    next.seoTitle = input.seoTitle;
  }
  if (input.seoDescription !== undefined) {
    next.seoDescription = input.seoDescription;
  }
  if (input.seoKeywords !== undefined) {
    next.seoKeywords = input.seoKeywords;
  }
  if (input.ogImageId !== undefined) {
    next.ogImageId = input.ogImageId;
  }

  let status = existing.status as ArticleStatus;
  let publishedAt = existing.publishedAt ?? null;
  let scheduledAt = existing.scheduledAt ?? null;

  if (input.status) {
    status = input.status;
  }
  if (input.publishedAt !== undefined) {
    publishedAt = input.publishedAt;
  }
  if (input.scheduledAt !== undefined) {
    scheduledAt = input.scheduledAt;
  }

  const normalized = resolveStatusAndTimestamps(status, publishedAt, scheduledAt);
  next.status = normalized.status;
  next.publishedAt = normalized.publishedAt;
  next.scheduledAt = normalized.scheduledAt;

  if (input.slug !== undefined || input.title !== undefined) {
    const base = input.slug ?? existing.slug;
    const needsNewSlug = input.slug !== undefined && input.slug !== existing.slug;

    if (needsNewSlug) {
      next.slug = await generateUniqueSlug(base ?? existing.title, existing.id);
    }
  }

  if (input.updatedBy !== undefined) {
    next.updatedBy = input.updatedBy;
  }

  const setFragments: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 2; // $1 reserved for id

  const addSet = (column: string, value: unknown) => {
    setFragments.push(`"${column}" = $${paramIndex}`);
    params.push(value);
    paramIndex += 1;
  };

  if (next.title !== undefined) addSet("title", next.title);
  if (next.content !== undefined) addSet("content", next.content);
  if (next.excerpt !== undefined) addSet("excerpt", next.excerpt);
  if (next.featuredImageId !== undefined) addSet("featured_image_id", next.featuredImageId);
  if (next.categoryId !== undefined) addSet("category_id", next.categoryId);
  if (next.seoTitle !== undefined) addSet("seo_title", next.seoTitle);
  if (next.seoDescription !== undefined) addSet("seo_description", next.seoDescription);
  if (next.seoKeywords !== undefined) addSet("seo_keywords", next.seoKeywords);
  if (next.ogImageId !== undefined) addSet("og_image_id", next.ogImageId);
  if (next.status !== undefined) addSet("status", next.status);
  if (next.publishedAt !== undefined) addSet("published_at", next.publishedAt);
  if (next.scheduledAt !== undefined) addSet("scheduled_at", next.scheduledAt);
  if (next.updatedBy !== undefined) addSet("updated_by", next.updatedBy);

  // Always bump updated_at, even if no other fields changed
  setFragments.push('"updated_at" = now()');

  const sql = `update "articles" set ${setFragments.join(", ")} where "id" = $1 returning *`;
  const result = await pool.query(sql, [id, ...params]);
  const row = (result.rows[0] as ArticleRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to update article");
  }

  return row;
}

export async function softDeleteArticle(id: string): Promise<void> {
  const result = await pool.query(
    'update "articles" set "deleted_at" = now() where "id" = $1',
    [id],
  );

  if (result.rowCount === 0) {
    throw new Error("Failed to delete article");
  }
}

export async function submitArticleForReview(id: string, authorId: string): Promise<ArticleRecord> {
  const article = await getArticleById(id);
  if (!article) {
    throw new Error("Article not found");
  }
  if (article.authorId !== authorId) {
    throw new Error("Not allowed to submit this article for review");
  }
  if (article.workflowState !== "DRAFT") {
    throw new Error("Only draft articles can be submitted for review");
  }

  const result = await pool.query(
    'update "articles" set "workflow_state" = $2, "submitted_for_review_at" = now(), "updated_at" = now(), "reviewed_at" = null, "reviewed_by" = null where "id" = $1 returning *',
    [id, "IN_REVIEW"],
  );
  const row = (result.rows[0] as ArticleRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to submit article for review");
  }

  return row;
}

export async function markArticleReviewed(id: string, reviewerId: string): Promise<ArticleRecord> {
  const article = await getArticleById(id);
  if (!article) {
    throw new Error("Article not found");
  }

  const result = await pool.query(
    'update "articles" set "workflow_state" = $2, "reviewed_at" = now(), "reviewed_by" = $3, "updated_at" = now() where "id" = $1 returning *',
    [id, "READY_FOR_PUBLISH", reviewerId],
  );
  const row = (result.rows[0] as ArticleRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to mark article as reviewed");
  }

  return row;
}

export async function sendBackArticleToDraft(id: string): Promise<ArticleRecord> {
  const article = await getArticleById(id);
  if (!article) {
    throw new Error("Article not found");
  }

  const result = await pool.query(
    'update "articles" set "workflow_state" = $2, "submitted_for_review_at" = null, "reviewed_at" = null, "reviewed_by" = null, "updated_at" = now() where "id" = $1 returning *',
    [id, "DRAFT"],
  );

  const row = (result.rows[0] as ArticleRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to send article back to draft");
  }

  return row;
}
