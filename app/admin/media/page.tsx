import Link from "next/link";

import { mediaFolders } from "@/db/schema";
import { ToastBanner } from "@/components/admin/toast-banner";
import { FolderTree } from "@/components/admin/folder-tree";
import { FilePreview } from "@/components/admin/file-preview";
import { db } from "@/lib/db/drizzle";
import { listMedia, type MediaType } from "@/lib/services/media-service";

type SearchParams = {
  type?: string;
  q?: string;
  folderId?: string;
  status?: string;
};

function parseMediaType(value?: string): MediaType | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (upper === "IMAGE" || upper === "VIDEO" || upper === "AUDIO" || upper === "DOCUMENT") {
    return upper as MediaType;
  }
  return undefined;
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const type = parseMediaType(resolvedParams.type);
  const search = resolvedParams.q?.toString() ?? "";
  const folderIdParam = resolvedParams.folderId;
  const folderId = typeof folderIdParam === "string" && folderIdParam ? folderIdParam : undefined;

  const [items, folders] = await Promise.all([
    listMedia({
      type,
      search: search || undefined,
      folderId: folderId ?? undefined,
    }),
    db.select().from(mediaFolders),
  ]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Media Library</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Browse and manage uploaded images, documents, and other files.
          </p>
        </div>
        <Link
          href="/admin/media/upload"
          className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
        >
          Upload
        </Link>
      </div>

      {resolvedParams.status === "uploaded" && (
        <ToastBanner
          variant="success"
          title="Media uploaded"
          message="Your file has been uploaded to the media library."
        />
      )}
      <div className="grid gap-6 md:grid-cols-[220px,1fr]">
        <aside>
          <FolderTree folders={folders} currentFolderId={folderId ?? null} />
        </aside>
        <div className="space-y-4">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <input type="hidden" name="folderId" value={folderId ?? ""} />
            <div className="flex flex-col gap-1">
              <label htmlFor="q" className="text-xs font-medium text-[var(--color-muted)]">
                Search
              </label>
              <input
                id="q"
                name="q"
                defaultValue={search}
                className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
                placeholder="Filename, caption, description…"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="type" className="text-xs font-medium text-[var(--color-muted)]">
                Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={type ?? ""}
                className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              >
                <option value="">All</option>
                <option value="IMAGE">Images</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="DOCUMENT">Documents</option>
              </select>
            </div>
            <button
              type="submit"
              className="h-9 rounded-md bg-[var(--color-secondary)] px-3 text-sm font-medium text-[var(--color-secondary-foreground)]"
            >
              Apply
            </button>
          </form>

          {items.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No media found.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
              {items.map((item) => (
                <FilePreview key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
