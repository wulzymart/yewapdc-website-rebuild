import { describe, it, expect } from "@jest/globals";

import { buildDashboardSummary } from "@/lib/services/dashboard-service";
import { createArticle } from "@/lib/services/article-service";
import { createEvent } from "@/lib/services/event-service";
import { createPromotion } from "@/lib/services/promotion-service";

describe("dashboard-service integration", () => {
  it("aggregates metrics and 14-day article chart for admin and author", async () => {
    const now = new Date();

    const adminId = "dashboard-admin";
    const authorId = `dashboard-author-${Date.now()}`;
    const otherAuthorId = `dashboard-other-${Date.now()}`;

    const articleDates: Date[] = [];
    for (let i = 0; i < 3; i += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      articleDates.push(d);
    }

    for (const date of articleDates) {
      await createArticle({
        title: `Dashboard Article ${date.toISOString()}`,
        content: "Dashboard test content",
        authorId,
        createdBy: authorId,
        status: "PUBLISHED",
        publishedAt: date,
      });
    }

    await createArticle({
      title: "Other Author Article",
      content: "Other author content",
      authorId: otherAuthorId,
      createdBy: otherAuthorId,
      status: "PUBLISHED",
      publishedAt: now,
    });

    const eventStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);

    await createEvent({
      title: "Dashboard Event",
      description: "Dashboard event",
      startDate: eventStart,
      endDate: eventEnd,
      status: "PUBLISHED",
      createdBy: adminId,
    });

    const promoStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const promoEnd = new Date(promoStart.getTime() + 24 * 60 * 60 * 1000);

    await createPromotion({
      title: "Dashboard Promotion",
      content: "Dashboard promotion",
      startDate: promoStart,
      endDate: promoEnd,
      position: "HERO",
      createdBy: adminId,
    });

    const adminSummary = await buildDashboardSummary({ role: "ADMIN", userId: adminId });

    const articlesMetric = adminSummary.metrics.find((m) => m.id === "articles");
    expect(articlesMetric).toBeDefined();
    expect(articlesMetric?.value).toBeGreaterThanOrEqual(4);

    expect(adminSummary.articlesChart.points).toHaveLength(14);
    const totalArticlesInChart = adminSummary.articlesChart.points.reduce(
      (sum, p) => sum + p.count,
      0,
    );
    expect(totalArticlesInChart).toBeGreaterThanOrEqual(4);

    const authorSummary = await buildDashboardSummary({ role: "AUTHOR", userId: authorId });
    const authorArticlesMetric = authorSummary.metrics.find((m) => m.id === "articles");
    expect(authorArticlesMetric).toBeDefined();
    expect(authorArticlesMetric?.value).toBe(3);

    expect(authorSummary.metrics.find((m) => m.id === "events")?.value).toBe(0);
    expect(authorSummary.metrics.find((m) => m.id === "promotions")?.value).toBe(0);
  });
});
