import fs from "node:fs/promises";
import path from "node:path";

import type { StorageAdapter, StorageFile, UploadParams } from "@/lib/storage/storage-adapter";

const baseDir = path.join(process.cwd(), "public", "uploads");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function toAbsolutePath(key: string): Promise<string> {
  const safeKey = key.replace(/^\/+/, "");
  const fullPath = path.join(baseDir, safeKey);
  const dir = path.dirname(fullPath);
  await ensureDir(dir);
  return fullPath;
}

export const localStorageAdapter: StorageAdapter = {
  async upload({ key, body, contentType }: UploadParams): Promise<StorageFile> {
    const fullPath = await toAbsolutePath(key);
    await fs.writeFile(fullPath, body);
    const stats = await fs.stat(fullPath);
    const url = `/uploads/${key.replace(/^\/+/, "")}`;
    return {
      key,
      url,
      size: stats.size,
      contentType,
      lastModified: stats.mtime,
    };
  },

  async delete(key: string): Promise<void> {
    const fullPath = await toAbsolutePath(key);
    await fs.rm(fullPath, { force: true });
  },

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key.replace(/^\/+/, "")}`;
  },

  async move(from: string, to: string): Promise<void> {
    const fromPath = await toAbsolutePath(from);
    const toPath = await toAbsolutePath(to);
    await fs.rename(fromPath, toPath);
  },

  async list(prefix?: string): Promise<StorageFile[]> {
    const dir = prefix ? path.join(baseDir, prefix) : baseDir;
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files: StorageFile[] = [];

      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const fullPath = path.join(dir, entry.name);
        const stats = await fs.stat(fullPath);
        const relPath = path.relative(baseDir, fullPath);
        files.push({
          key: relPath,
          url: `/uploads/${relPath.replace(/^\/+/, "")}`,
          size: stats.size,
          contentType: "application/octet-stream",
          lastModified: stats.mtime,
        });
      }

      return files;
    } catch {
      return [];
    }
  },
};
