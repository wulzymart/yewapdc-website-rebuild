import { listPublishedArticles, type ArticleRecord } from "@/lib/services/article-service";
import { listEvents, type EventRecord } from "@/lib/services/event-service";
import { listPromotionsForAdmin, type PromotionRecord } from "@/lib/services/promotion-service";
import { listMedia, type MediaRecord } from "@/lib/services/media-service";
import type { UserRole } from "@/lib/auth/permissions";

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  delta?: number;
  trend?: "up" | "down" | "flat";
  href?: string;
}

export interface ArticlesChartPoint {
  date: string;
  count: number;
}

export interface ArticlesChartSeries {
  points: ArticlesChartPoint[];
}

export interface UpcomingItem {
  id: string;
  type: "event" | "promotion";
  title: string;
  start: Date;
  end?: Date;
  href: string;
}

export interface DashboardActivity {
  id: string;
  type: "article" | "event" | "promotion" | "media";
  title: string;
  action: "created" | "updated";
  at: Date;
  actor?: string;
  href: string;
}

export interface DashboardSummary {
  metrics: DashboardMetric[];
  articlesChart: ArticlesChartSeries;
  upcoming: UpcomingItem[];
  activity: DashboardActivity[];
}

interface BuildContext {
  role: UserRole;
  userId: string;
}

function isAuthor(role: UserRole): boolean {
  return role === "AUTHOR";
}

function resolveArticleDate(article: ArticleRecord): Date | null {
  if (article.publishedAt) return article.publishedAt;
  if (article.scheduledAt) return article.scheduledAt;
  return null;
}

function buildArticlesChart(articles: ArticleRecord[]): ArticlesChartSeries {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 13); // 14 days including today

  const buckets = new Map<string, number>();

  for (let i = 0; i < 14; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  for (const article of articles) {
    const d = resolveArticleDate(article);
    if (!d) continue;
    const key = d.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  const points: ArticlesChartPoint[] = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    points.push({ date: key, count: buckets.get(key) ?? 0 });
  }

  return { points };
}

function roleFilterArticle(role: UserRole, userId: string, article: ArticleRecord): boolean {
  if (!isAuthor(role)) return true;
  return article.authorId === userId || article.createdBy === userId;
}

function roleFilterEvent(role: UserRole, userId: string, event: EventRecord): boolean {
  if (!isAuthor(role)) return true;
  return event.createdBy === userId;
}

function roleFilterPromotion(role: UserRole, userId: string, promotion: PromotionRecord): boolean {
  if (!isAuthor(role)) return true;
  return promotion.createdBy === userId;
}

function roleFilterMedia(role: UserRole, userId: string, item: MediaRecord): boolean {
  if (!isAuthor(role)) return true;
  return item.uploadedBy === userId;
}

export async function buildDashboardSummary(context: BuildContext): Promise<DashboardSummary> {
  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [articles, events, promotions, mediaItems] = await Promise.all([
    listPublishedArticles(),
    listEvents({ status: "PUBLISHED" }),
    listPromotionsForAdmin(),
    listMedia(),
  ]);

  const scopedArticles = articles.filter((a) => roleFilterArticle(context.role, context.userId, a));
  const scopedEvents = events.filter((e) => roleFilterEvent(context.role, context.userId, e));
  const scopedPromotions = promotions.filter((p) => roleFilterPromotion(context.role, context.userId, p));
  const scopedMedia = mediaItems.filter((m) => roleFilterMedia(context.role, context.userId, m));

  const metrics: DashboardMetric[] = [
    {
      id: "articles",
      label: "Published articles",
      value: scopedArticles.length,
      href: "/admin/articles",
    },
    {
      id: "events",
      label: "Published events",
      value: scopedEvents.length,
      href: "/admin/events",
    },
    {
      id: "promotions",
      label: "Active promotions",
      value: scopedPromotions.filter((p) => p.isActive).length,
      href: "/admin/promotions",
    },
    {
      id: "media",
      label: "Media items",
      value: scopedMedia.length,
      href: "/admin/media",
    },
  ];

  const articlesChart = buildArticlesChart(scopedArticles);

  const upcomingEvents: UpcomingItem[] = scopedEvents
    .filter((e) => e.startDate >= now && e.startDate <= inThirtyDays)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      type: "event",
      title: e.title,
      start: e.startDate,
      end: e.endDate ?? undefined,
      href: "/admin/events",
    }));

  const upcomingPromotions: UpcomingItem[] = scopedPromotions
    .filter((p) => p.startDate >= now && p.startDate <= inThirtyDays)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      type: "promotion",
      title: p.title,
      start: p.startDate,
      end: p.endDate ?? undefined,
      href: "/admin/promotions",
    }));

  const upcoming = [...upcomingEvents, ...upcomingPromotions].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  ).slice(0, 8);

  const activity: DashboardActivity[] = [];

  scopedArticles
    .sort((a, b) => (b.updatedAt?.getTime?.() ?? 0) - (a.updatedAt?.getTime?.() ?? 0))
    .slice(0, 5)
    .forEach((a) => {
      const at = a.updatedAt ?? a.createdAt;
      activity.push({
        id: a.id,
        type: "article",
        title: a.title,
        action: a.updatedAt ? "updated" : "created",
        at,
        actor: a.updatedBy ?? a.createdBy ?? undefined,
        href: "/admin/articles",
      });
    });

  scopedEvents
    .sort((a, b) => (b.updatedAt?.getTime?.() ?? 0) - (a.updatedAt?.getTime?.() ?? 0))
    .slice(0, 5)
    .forEach((e) => {
      const at = e.updatedAt ?? e.createdAt;
      activity.push({
        id: e.id,
        type: "event",
        title: e.title,
        action: e.updatedAt ? "updated" : "created",
        at,
        actor: e.updatedBy ?? e.createdBy ?? undefined,
        href: "/admin/events",
      });
    });

  scopedPromotions
    .sort((a, b) => (b.updatedAt?.getTime?.() ?? 0) - (a.updatedAt?.getTime?.() ?? 0))
    .slice(0, 5)
    .forEach((p) => {
      const at = p.updatedAt ?? p.createdAt;
      activity.push({
        id: p.id,
        type: "promotion",
        title: p.title,
        action: p.updatedAt ? "updated" : "created",
        at,
        actor: p.updatedBy ?? p.createdBy ?? undefined,
        href: "/admin/promotions",
      });
    });

  scopedMedia
    .sort((a, b) => (b.updatedAt?.getTime?.() ?? 0) - (a.updatedAt?.getTime?.() ?? 0))
    .slice(0, 5)
    .forEach((m) => {
      const at = m.updatedAt ?? m.createdAt;
      activity.push({
        id: m.id,
        type: "media",
        title: m.originalFilename,
        action: m.updatedAt ? "updated" : "created",
        at,
        actor: m.uploadedBy ?? undefined,
        href: "/admin/media",
      });
    });

  activity.sort((a, b) => b.at.getTime() - a.at.getTime());

  return {
    metrics,
    articlesChart,
    upcoming,
    activity: activity.slice(0, 10),
  };
}
