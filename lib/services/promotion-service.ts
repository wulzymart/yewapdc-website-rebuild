import { db, pool } from "@/lib/db/drizzle";
import { promotions, promotionPositionEnum } from "@/db/schema";

export type PromotionRecord = typeof promotions.$inferSelect;
export type PromotionPosition = (typeof promotionPositionEnum.enumValues)[number];

export interface CreatePromotionInput {
  title: string;
  content: string;
  mediaId?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  startDate: Date;
  endDate: Date;
  priority?: number;
  position: PromotionPosition;
  createdBy?: string | null;
}

export interface UpdatePromotionInput {
  title?: string;
  content?: string;
  mediaId?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  startDate?: Date;
  endDate?: Date;
  priority?: number;
  position?: PromotionPosition;
  isActive?: boolean;
  updatedBy?: string | null;
}

export interface ListPromotionsFilter {
  position?: PromotionPosition;
  activeOnly?: boolean;
  now?: Date;
}

export async function createPromotion(input: CreatePromotionInput): Promise<PromotionRecord> {
  const [created] = await db
    .insert(promotions)
    .values({
      title: input.title,
      content: input.content,
      mediaId: input.mediaId ?? null,
      ctaText: input.ctaText ?? null,
      ctaLink: input.ctaLink ?? null,
      startDate: input.startDate,
      endDate: input.endDate,
      priority: input.priority ?? 0,
      position: input.position,
      isActive: true,
      createdBy: input.createdBy ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create promotion");
  }

  return created;
}

export async function getPromotionById(id: string): Promise<PromotionRecord | null> {
  const rows = await db.select().from(promotions);
  const row = rows.find((item) => item.id === id && !item.deletedAt);
  return row ?? null;
}

export async function listActivePromotions(filter: ListPromotionsFilter = {}): Promise<PromotionRecord[]> {
  const rows = await db.select().from(promotions);
  const now = filter.now ?? new Date();

  return rows
    .filter((row) => {
      if (row.deletedAt) return false;
      if (filter.position && row.position !== filter.position) return false;
      if (filter.activeOnly ?? true) {
        if (!row.isActive) return false;
        if (row.startDate > now) return false;
        if (row.endDate < now) return false;
      }
      return true;
    })
    .sort((a, b) => b.priority - a.priority);
}

export async function updatePromotion(
  id: string,
  input: UpdatePromotionInput,
): Promise<PromotionRecord> {
  const existing = await getPromotionById(id);
  if (!existing) {
    throw new Error("Promotion not found");
  }

  const next: Partial<PromotionRecord> = {};

  if (input.title !== undefined) next.title = input.title;
  if (input.content !== undefined) next.content = input.content;
  if (input.mediaId !== undefined) next.mediaId = input.mediaId;
  if (input.ctaText !== undefined) next.ctaText = input.ctaText;
  if (input.ctaLink !== undefined) next.ctaLink = input.ctaLink;
  if (input.startDate !== undefined) next.startDate = input.startDate;
  if (input.endDate !== undefined) next.endDate = input.endDate;
  if (input.priority !== undefined) next.priority = input.priority;
  if (input.position !== undefined) next.position = input.position;
  if (input.isActive !== undefined) next.isActive = input.isActive;
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
  if (next.content !== undefined) addSet("content", next.content);
  if (next.mediaId !== undefined) addSet("media_id", next.mediaId);
  if (next.ctaText !== undefined) addSet("cta_text", next.ctaText);
  if (next.ctaLink !== undefined) addSet("cta_link", next.ctaLink);
  if (next.startDate !== undefined) addSet("start_date", next.startDate);
  if (next.endDate !== undefined) addSet("end_date", next.endDate);
  if (next.priority !== undefined) addSet("priority", next.priority);
  if (next.position !== undefined) addSet("position", next.position);
  if (next.isActive !== undefined) addSet("is_active", next.isActive);
  if (next.updatedBy !== undefined) addSet("updated_by", next.updatedBy);

  setFragments.push('"updated_at" = now()');

  const sql = `update "promotions" set ${setFragments.join(", ")} where "id" = $1 returning *`;
  const result = await pool.query(sql, [id, ...params]);
  const row = (result.rows[0] as PromotionRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to update promotion");
  }

  return row;
}

export async function softDeletePromotion(id: string): Promise<void> {
  const result = await pool.query(
    'update "promotions" set "deleted_at" = now() where "id" = $1',
    [id],
  );

  if (result.rowCount === 0) {
    throw new Error("Failed to delete promotion");
  }
}

export async function listPromotionsForAdmin(): Promise<PromotionRecord[]> {
  const rows = await db.select().from(promotions);
  return rows.filter((row) => !row.deletedAt);
}
