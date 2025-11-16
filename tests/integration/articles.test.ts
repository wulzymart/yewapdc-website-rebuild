import { describe, it, expect } from "@jest/globals";

import { createArticle, listPublishedArticles, softDeleteArticle, updateArticle } from "@/lib/services/article-service";

// NOTE: These tests assume a working test database configured via DATABASE_URL.
// They exercise the article service end-to-end rather than mocking Drizzle.

describe("articles integration", () => {
  it("creates a draft article and then publishes it", async () => {
    const title = `Test Article ${Date.now()}`;

    const created = await createArticle({
      title,
      content: "Test content",
      authorId: "test-author-id",
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe("DRAFT");

    const updated = await updateArticle(created.id, {
      status: "PUBLISHED",
    });

    expect(updated.status).toBe("PUBLISHED");

    const published = await listPublishedArticles();
    const found = published.find((a) => a.id === created.id);
    expect(found).toBeDefined();

    await softDeleteArticle(created.id);
  });
});
