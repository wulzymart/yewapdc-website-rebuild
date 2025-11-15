import crypto from "node:crypto";
import path from "node:path";

import { db, pool } from "@/lib/db/drizzle";
import { media } from "@/db/schema";
import { getStorageAdapter, type StorageProvider } from "@/lib/storage/storage-adapter";
import { createThumbnail, getImageSize } from "@/lib/utils/image-processor";
import { env } from "@/lib/utils/env";

export type MediaRecord = typeof media.$inferSelect;

export type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";

interface CreateMediaInput {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  type: MediaType;
  folderId?: string | null;
  uploadedBy?: string;
  altText?: string;
  caption?: string;
  description?: string;
}

function mapStorageProvider(provider: StorageProvider): "LOCAL" | "S3" | "SUPABASE" {
  switch (provider) {
    case "local":
      return "LOCAL";
    case "s3":
      return "S3";
    case "supabase":
      return "SUPABASE";
    default:
      return "LOCAL";
  }
}

function buildObjectKeys(type: MediaType, originalFilename: string) {
  const ext = path.extname(originalFilename) || "";
  const baseName = crypto.randomUUID();
  const dir = type === "IMAGE" ? "images" : "files";
  const key = `${dir}/${baseName}${ext}`;
  const thumbnailKey = type === "IMAGE" ? `${dir}/thumbnails/${baseName}${ext}` : undefined;
  const filename = path.basename(key);
  return { key, thumbnailKey, filename };
}

export interface MediaFilter {
  type?: MediaType;
  folderId?: string | null;
  search?: string;
}

export async function getMediaById(id: string): Promise<MediaRecord | null> {
  const rows = await db.select().from(media);
  const row = rows.find((item) => item.id === id && !item.deletedAt);
  return row ?? null;
}

export async function deleteMedia(id: string): Promise<void> {
  await pool.query('update "media" set "deleted_at" = now() where "id" = $1', [id]);
}

export async function createMedia(input: CreateMediaInput): Promise<MediaRecord> {
  const storage = getStorageAdapter();
  const providerValue = mapStorageProvider(env.STORAGE_PROVIDER);

  const { key, thumbnailKey, filename } = buildObjectKeys(input.type, input.originalFilename);

  let width: number | null = null;
  let height: number | null = null;
  let thumbnailUrl: string | null = null;

  if (input.type === "IMAGE") {
    const size = await getImageSize(input.buffer);
    width = size.width;
    height = size.height;

    if (thumbnailKey) {
      const thumbBuffer = await createThumbnail(input.buffer, 400);
      const thumb = await storage.upload({
        key: thumbnailKey,
        body: thumbBuffer,
        contentType: input.mimeType,
      });
      thumbnailUrl = thumb.url;
    }
  }

  const uploaded = await storage.upload({
    key,
    body: input.buffer,
    contentType: input.mimeType,
  });

  const [created] = await db
    .insert(media)
    .values({
      filename,
      originalFilename: input.originalFilename,
      url: uploaded.url,
      storageProvider: providerValue,
      storagePath: key,
      type: input.type,
      mimeType: input.mimeType,
      size: uploaded.size,
      width: width ?? undefined,
      height: height ?? undefined,
      duration: undefined,
      altText: input.altText,
      caption: input.caption,
      description: input.description,
      folderId: input.folderId ?? null,
      thumbnailUrl: thumbnailUrl ?? undefined,
      uploadedBy: input.uploadedBy ?? undefined,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create media record");
  }

  return created;
}

export async function listMedia(filter: MediaFilter = {}): Promise<MediaRecord[]> {
  const rows = await db.select().from(media);

  const { type, folderId, search } = filter;
  const term = search?.trim().toLowerCase() ?? "";

  return rows.filter((row) => {
    if (row.deletedAt) return false;
    if (type && row.type !== type) return false;
    if (folderId !== undefined) {
      if (folderId === null ? row.folderId !== null : row.folderId !== folderId) {
        return false;
      }
    }
    if (term) {
      const haystack = [
        row.filename,
        row.originalFilename,
        row.altText,
        row.caption,
        row.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(term)) return false;
    }

    return true;
  });
}
