import { describe, it, expect } from "@jest/globals";

import {
  createArticle,
  markArticleReviewed,
  sendBackArticleToDraft,
  submitArticleForReview,
} from "@/lib/services/article-service";
import {
  createEvent,
  markEventReviewed,
  sendBackEventToDraft,
  submitEventForReview,
} from "@/lib/services/event-service";

// NOTE: These tests assume a working test database configured via DATABASE_URL.
// They exercise the review workflow helpers end-to-end rather than mocking Drizzle.

describe("author review workflow", () => {
  it("allows an author to submit their own article and event for review", async () => {
    const authorId = `author-${Date.now()}`;

    const article = await createArticle({
      title: `Review Article ${Date.now()}`,
      content: "Test content",
      authorId,
    });

    expect(article.workflowState).toBe("DRAFT");

    const inReview = await submitArticleForReview(article.id, authorId);
    expect(inReview.workflowState).toBe("IN_REVIEW");

    const reviewed = await markArticleReviewed(article.id, "reviewer-id");
    expect(reviewed.workflowState).toBe("READY_FOR_PUBLISH");

    const backToDraft = await sendBackArticleToDraft(article.id);
    expect(backToDraft.workflowState).toBe("DRAFT");

    const event = await createEvent({
      title: `Review Event ${Date.now()}`,
      description: "Test event",
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 60 * 1000),
      createdBy: authorId,
    });

    expect(event.workflowState).toBe("DRAFT");

    const eventInReview = await submitEventForReview(event.id, authorId);
    expect(eventInReview.workflowState).toBe("IN_REVIEW");

    const eventReviewed = await markEventReviewed(event.id, "reviewer-id");
    expect(eventReviewed.workflowState).toBe("READY_FOR_PUBLISH");

    const eventBackToDraft = await sendBackEventToDraft(event.id);
    expect(eventBackToDraft.workflowState).toBe("DRAFT");
  });

  it("prevents submitting content for review if the caller is not the creator", async () => {
    const authorId = `author-${Date.now()}`;
    const otherUserId = `other-${Date.now()}`;

    const article = await createArticle({
      title: `Foreign Article ${Date.now()}`,
      content: "Test content",
      authorId,
    });

    await expect(submitArticleForReview(article.id, otherUserId)).rejects.toThrow();

    const event = await createEvent({
      title: `Foreign Event ${Date.now()}`,
      description: "Test event",
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 60 * 1000),
      createdBy: authorId,
    });

    await expect(submitEventForReview(event.id, otherUserId)).rejects.toThrow();
  });
});
