import { env } from "@/lib/utils/env";
import { localStorageAdapter } from "@/lib/storage/local-storage";
import { s3StorageAdapter } from "@/lib/storage/s3-storage";

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
    cachedAdapter = localStorageAdapter;
    return cachedAdapter;
  }

  if (env.STORAGE_PROVIDER === "s3") {
    cachedAdapter = s3StorageAdapter;
    return cachedAdapter;
  }

  cachedAdapter = localStorageAdapter;
  return cachedAdapter;
}
