import { db, pool } from "@/lib/db/drizzle";
import { events, eventStatusEnum, workflowStateEnum } from "@/db/schema";

export type EventRecord = typeof events.$inferSelect;
export type EventStatus = (typeof eventStatusEnum.enumValues)[number];
export type EventWorkflowState = (typeof workflowStateEnum.enumValues)[number];

export interface CreateEventInput {
  title: string;
  slug?: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string | null;
  categoryId?: string | null;
  status?: EventStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdBy?: string | null;
}

export interface UpdateEventInput {
  title?: string;
  slug?: string | null;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string | null;
  categoryId?: string | null;
  status?: EventStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedBy?: string | null;
}

export interface ListEventsFilter {
  status?: EventStatus;
  categoryId?: string | null;
  from?: Date;
  to?: Date;
  search?: string;
  createdBy?: string;
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
  const base = slugify(baseTitle) || "event";
  const rows = await db.select().from(events);
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

export async function createEvent(input: CreateEventInput): Promise<EventRecord> {
  const status: EventStatus = input.status ?? "DRAFT";

  const slug = await generateUniqueSlug(input.slug ?? input.title);

  const [created] = await db
    .insert(events)
    .values({
      title: input.title,
      slug,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location ?? null,
      categoryId: input.categoryId ?? null,
      status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      createdBy: input.createdBy ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create event");
  }

  return created;
}

export async function getEventById(id: string): Promise<EventRecord | null> {
  const rows = await db.select().from(events);
  const row = rows.find((item) => item.id === id && !item.deletedAt);
  return row ?? null;
}

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  const rows = await db.select().from(events);
  const row = rows.find((item) => item.slug === slug && !item.deletedAt && item.status === "PUBLISHED");
  return row ?? null;
}

export async function listEvents(filter: ListEventsFilter = {}): Promise<EventRecord[]> {
  const rows = await db.select().from(events);
  const term = filter.search?.trim().toLowerCase() ?? "";

  return rows.filter((row) => {
    if (row.deletedAt) return false;
    if (filter.categoryId !== undefined) {
      if (filter.categoryId === null ? row.categoryId !== null : row.categoryId !== filter.categoryId) {
        return false;
      }
    }
    // Restrict by creator when provided (used for Author visibility)
    if (filter.createdBy && row.createdBy !== filter.createdBy) {
      return false;
    }
    if (filter.status && row.status !== filter.status) return false;
    if (filter.from && row.startDate < filter.from) return false;
    if (filter.to && row.startDate > filter.to) return false;
    if (term) {
      const haystack = [row.title, row.description, row.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<EventRecord> {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error("Event not found");
  }

  const next: Partial<EventRecord> = {};

  if (input.title !== undefined) next.title = input.title;
  if (input.description !== undefined) next.description = input.description;
  if (input.startDate !== undefined) next.startDate = input.startDate;
  if (input.endDate !== undefined) next.endDate = input.endDate;
  if (input.location !== undefined) next.location = input.location;
  if (input.categoryId !== undefined) next.categoryId = input.categoryId;
  if (input.status !== undefined) next.status = input.status;
  if (input.seoTitle !== undefined) next.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) next.seoDescription = input.seoDescription;
  if (input.updatedBy !== undefined) next.updatedBy = input.updatedBy;

  const setFragments: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 2;

  const addSet = (column: string, value: unknown) => {
    setFragments.push(`"${column}" = $${paramIndex}`);
    params.push(value);
    paramIndex += 1;
  };

  if (next.title !== undefined) addSet("title", next.title);
  if (next.description !== undefined) addSet("description", next.description);
  if (next.startDate !== undefined) addSet("start_date", next.startDate);
  if (next.endDate !== undefined) addSet("end_date", next.endDate);
  if (next.location !== undefined) addSet("location", next.location);
  if (next.categoryId !== undefined) addSet("category_id", next.categoryId);
  if (next.status !== undefined) addSet("status", next.status);
  if (next.seoTitle !== undefined) addSet("seo_title", next.seoTitle);
  if (next.seoDescription !== undefined) addSet("seo_description", next.seoDescription);
  if (next.updatedBy !== undefined) addSet("updated_by", next.updatedBy);

  setFragments.push('"updated_at" = now()');

  const sql = `update "events" set ${setFragments.join(", ")} where "id" = $1 returning *`;
  const result = await pool.query(sql, [id, ...params]);
  const row = (result.rows[0] as EventRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to update event");
  }

  return row;
}

export async function softDeleteEvent(id: string): Promise<void> {
  const result = await pool.query(
    'update "events" set "deleted_at" = now() where "id" = $1',
    [id],
  );

  if (result.rowCount === 0) {
    throw new Error("Failed to delete event");
  }
}

export async function submitEventForReview(id: string, authorId: string): Promise<EventRecord> {
  const event = await getEventById(id);
  if (!event) {
    throw new Error("Event not found");
  }
  if (event.createdBy && event.createdBy !== authorId) {
    throw new Error("Not allowed to submit this event for review");
  }
  if (event.workflowState !== "DRAFT") {
    throw new Error("Only draft events can be submitted for review");
  }

  const result = await pool.query(
    'update "events" set "workflow_state" = $2, "submitted_for_review_at" = now(), "updated_at" = now(), "reviewed_at" = null, "reviewed_by" = null where "id" = $1 returning *',
    [id, "IN_REVIEW"],
  );

  const row = (result.rows[0] as EventRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to submit event for review");
  }

  return row;
}

export async function markEventReviewed(id: string, reviewerId: string): Promise<EventRecord> {
  const event = await getEventById(id);
  if (!event) {
    throw new Error("Event not found");
  }

  const result = await pool.query(
    'update "events" set "workflow_state" = $2, "reviewed_at" = now(), "reviewed_by" = $3, "updated_at" = now() where "id" = $1 returning *',
    [id, "READY_FOR_PUBLISH", reviewerId],
  );

  const row = (result.rows[0] as EventRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to mark event as reviewed");
  }

  return row;
}

export async function sendBackEventToDraft(id: string): Promise<EventRecord> {
  const event = await getEventById(id);
  if (!event) {
    throw new Error("Event not found");
  }

  const result = await pool.query(
    'update "events" set "workflow_state" = $2, "submitted_for_review_at" = null, "reviewed_at" = null, "reviewed_by" = null, "updated_at" = now() where "id" = $1 returning *',
    [id, "DRAFT"],
  );

  const row = (result.rows[0] as EventRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to send event back to draft");
  }

  return row;
}
