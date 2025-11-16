import { describe, it, expect } from "@jest/globals";

import { createPromotion, listActivePromotions, softDeletePromotion } from "@/lib/services/promotion-service";

describe("promotions integration", () => {
  it("creates an active promotion and sees it in the active list", async () => {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);

    const created = await createPromotion({
      title: `Test Promotion ${Date.now()}`,
      content: "Test promotion content",
      startDate: now,
      endDate: later,
      position: "HERO",
    });

    const active = await listActivePromotions({});
    const found = active.find((p) => p.id === created.id);

    expect(found).toBeDefined();

    await softDeletePromotion(created.id);
  });
});
