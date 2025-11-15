import { env } from "@/lib/utils/env";

export type StorageProvider = "local" | "s3" | "supabase";

export interface UploadParams {
  key: string;
  contentType: string;
  body: Buffer | Uint8Array;
}

export interface StorageFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
  lastModified?: Date;
}

export interface StorageAdapter {
  upload(params: UploadParams): Promise<StorageFile>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
  move(from: string, to: string): Promise<void>;
  list(prefix?: string): Promise<StorageFile[]>;
}

let cachedAdapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (cachedAdapter) return cachedAdapter;

  if (env.STORAGE_PROVIDER === "local") {
    const { localStorageAdapter } = require("@/lib/storage/local-storage") as typeof import("@/lib/storage/local-storage");
    cachedAdapter = localStorageAdapter;
    return cachedAdapter;
  }

  if (env.STORAGE_PROVIDER === "s3") {
    const { s3StorageAdapter } = require("@/lib/storage/s3-storage") as typeof import("@/lib/storage/s3-storage");
    cachedAdapter = s3StorageAdapter;
    return cachedAdapter;
  }

  const { localStorageAdapter } = require("@/lib/storage/local-storage") as typeof import("@/lib/storage/local-storage");
  cachedAdapter = localStorageAdapter;
  return cachedAdapter;
}
