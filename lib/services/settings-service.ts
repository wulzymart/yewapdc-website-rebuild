import { db, pool } from "@/lib/db/drizzle";
import {
  navLocationEnum,
  navigationMenus,
  settingTypeEnum,
  siteSettings,
} from "@/db/schema";

export type SiteSettingRecord = typeof siteSettings.$inferSelect;
export type SettingType = (typeof settingTypeEnum.enumValues)[number];

export type NavigationMenuRecord = typeof navigationMenus.$inferSelect;
export type NavLocation = (typeof navLocationEnum.enumValues)[number];

export interface UpsertSettingInput {
  key: string;
  value: string;
  type: SettingType;
  updatedBy?: string | null;
}

export interface NavItem {
  label: string;
  url: string;
  external?: boolean;
  children?: NavItem[];
}

export interface UpsertNavigationMenuInput {
  location: NavLocation;
  items: NavItem[];
  updatedBy?: string | null;
}

export async function listSettings(): Promise<SiteSettingRecord[]> {
  return db.select().from(siteSettings);
}

export async function getSetting(key: string): Promise<SiteSettingRecord | null> {
  const rows = await db.select().from(siteSettings);
  const row = rows.find((setting) => setting.key === key) ?? null;
  return row;
}

export async function upsertSetting(input: UpsertSettingInput): Promise<SiteSettingRecord> {
  const existing = await getSetting(input.key);

  if (!existing) {
    const [created] = await db
      .insert(siteSettings)
      .values({
        key: input.key,
        value: input.value,
        type: input.type,
        updatedBy: input.updatedBy ?? null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create setting");
    }

    return created;
  }

  const sql =
    'update "site_settings" set "value" = $2, "type" = $3, "updated_at" = now(), "updated_by" = $4 where "id" = $1 returning *';
  const result = await pool.query(sql, [
    existing.id,
    input.value,
    input.type,
    input.updatedBy ?? null,
  ]);
  const row = (result.rows[0] as SiteSettingRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to update setting");
  }

  return row;
}

export async function deleteSetting(id: string): Promise<void> {
  const result = await pool.query('delete from "site_settings" where "id" = $1', [id]);
  if (result.rowCount === 0) {
    throw new Error("Failed to delete setting");
  }
}

export async function listNavigationMenus(): Promise<NavigationMenuRecord[]> {
  return db.select().from(navigationMenus);
}

export async function getNavigationMenuByLocation(
  location: NavLocation,
): Promise<NavigationMenuRecord | null> {
  const rows = await db.select().from(navigationMenus);
  const row = rows.find((menu) => menu.location === location) ?? null;
  return row;
}

export async function upsertNavigationMenu(
  input: UpsertNavigationMenuInput,
): Promise<NavigationMenuRecord> {
  const existing = await getNavigationMenuByLocation(input.location);

  if (!existing) {
    const [created] = await db
      .insert(navigationMenus)
      .values({
        location: input.location,
        items: input.items,
        updatedBy: input.updatedBy ?? null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create navigation menu");
    }

    return created;
  }

  const sql =
    'update "navigation_menus" set "items" = $2, "updated_at" = now(), "updated_by" = $3 where "id" = $1 returning *';
  const result = await pool.query(sql, [
    existing.id,
    input.items,
    input.updatedBy ?? null,
  ]);
  const row = (result.rows[0] as NavigationMenuRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to update navigation menu");
  }

  return row;
}
