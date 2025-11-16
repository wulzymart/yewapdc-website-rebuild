import { describe, it, expect } from "@jest/globals";

import { db } from "@/lib/db/drizzle";
import { media, mediaFolders } from "@/db/schema";
import { listMedia } from "@/lib/services/media-service";

describe("media integration", () => {
  it("filters media by search term across metadata fields", async () => {
    const uniqueSuffix = Date.now();

    const [alpha] = await db
      .insert(media)
      .values({
        filename: `integration-alpha-${uniqueSuffix}.jpg`,
        originalFilename: `Alpha Original ${uniqueSuffix}.jpg`,
        url: "https://example.com/alpha.jpg",
        storageProvider: "LOCAL",
        storagePath: `images/alpha-${uniqueSuffix}.jpg`,
        type: "IMAGE",
        mimeType: "image/jpeg",
        size: 1234,
        altText: "Alpha Alt Text",
        caption: "Alpha Caption",
        description: "Alpha Description",
      })
      .returning();

    const [beta] = await db
      .insert(media)
      .values({
        filename: `integration-beta-${uniqueSuffix}.pdf`,
        originalFilename: `Beta Original ${uniqueSuffix}.pdf`,
        url: "https://example.com/beta.pdf",
        storageProvider: "LOCAL",
        storagePath: `files/beta-${uniqueSuffix}.pdf`,
        type: "DOCUMENT",
        mimeType: "application/pdf",
        size: 5678,
        altText: "Beta Alt Text",
        caption: "Beta Caption",
        description: "Beta Description",
      })
      .returning();

    const results = await listMedia({ search: "alpha" });
    const ids = new Set(results.map((row) => row.id));

    expect(ids.has(alpha.id)).toBe(true);
    expect(ids.has(beta.id)).toBe(false);
  });

  it("filters media by type and folder for folder navigation", async () => {
    const uniqueSuffix = Date.now();

    const [rootFolder] = await db
      .insert(mediaFolders)
      .values({
        name: `Root Folder ${uniqueSuffix}`,
        path: `/root-${uniqueSuffix}`,
      })
      .returning();

    const [childFolder] = await db
      .insert(mediaFolders)
      .values({
        name: `Child Folder ${uniqueSuffix}`,
        parentId: rootFolder.id,
        path: `/root-${uniqueSuffix}/child-${uniqueSuffix}`,
      })
      .returning();

    const [imageInRoot] = await db
      .insert(media)
      .values({
        filename: `integration-root-${uniqueSuffix}.jpg`,
        originalFilename: `Root ${uniqueSuffix}.jpg`,
        url: "https://example.com/root.jpg",
        storageProvider: "LOCAL",
        storagePath: `images/root-${uniqueSuffix}.jpg`,
        type: "IMAGE",
        mimeType: "image/jpeg",
        size: 1000,
        folderId: rootFolder.id,
      })
      .returning();

    const [imageInChild] = await db
      .insert(media)
      .values({
        filename: `integration-child-${uniqueSuffix}.jpg`,
        originalFilename: `Child ${uniqueSuffix}.jpg`,
        url: "https://example.com/child.jpg",
        storageProvider: "LOCAL",
        storagePath: `images/child-${uniqueSuffix}.jpg`,
        type: "IMAGE",
        mimeType: "image/jpeg",
        size: 1000,
        folderId: childFolder.id,
      })
      .returning();

    const [unassigned] = await db
      .insert(media)
      .values({
        filename: `integration-unassigned-${uniqueSuffix}.jpg`,
        originalFilename: `Unassigned ${uniqueSuffix}.jpg`,
        url: "https://example.com/unassigned.jpg",
        storageProvider: "LOCAL",
        storagePath: `images/unassigned-${uniqueSuffix}.jpg`,
        type: "IMAGE",
        mimeType: "image/jpeg",
        size: 1000,
        folderId: null,
      })
      .returning();

    const rootResults = await listMedia({ folderId: rootFolder.id, type: "IMAGE" });
    const rootIds = new Set(rootResults.map((row) => row.id));
    expect(rootIds.has(imageInRoot.id)).toBe(true);
    expect(rootIds.has(imageInChild.id)).toBe(false);
    expect(rootIds.has(unassigned.id)).toBe(false);

    const childResults = await listMedia({ folderId: childFolder.id });
    const childIds = new Set(childResults.map((row) => row.id));
    expect(childIds.has(imageInChild.id)).toBe(true);
    expect(childIds.has(imageInRoot.id)).toBe(false);

    const unassignedResults = await listMedia({ folderId: null });
    const unassignedIds = new Set(unassignedResults.map((row) => row.id));
    expect(unassignedIds.has(unassigned.id)).toBe(true);
    expect(unassignedIds.has(imageInRoot.id)).toBe(false);
    expect(unassignedIds.has(imageInChild.id)).toBe(false);
  });
});
