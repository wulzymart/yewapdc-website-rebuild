import { describe, it, expect } from "@jest/globals";

import { createEvent, listEvents, softDeleteEvent, updateEvent } from "@/lib/services/event-service";

describe("events integration", () => {
  it("creates an event and updates its status", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const created = await createEvent({
      title: `Test Event ${Date.now()}`,
      description: "Test event description",
      startDate: start,
      endDate: end,
    });

    expect(created.id).toBeDefined();

    const updated = await updateEvent(created.id, { status: "PUBLISHED" });
    expect(updated.status).toBe("PUBLISHED");

    const events = await listEvents({});
    const found = events.find((e) => e.id === created.id);
    expect(found).toBeDefined();

    await softDeleteEvent(created.id);
  });
});
