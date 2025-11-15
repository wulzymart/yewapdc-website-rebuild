import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createMedia, type MediaType } from "@/lib/services/media-service";

function inferMediaType(mime: string): MediaType {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  return "DOCUMENT";
}

async function uploadMedia(formData: FormData) {
  "use server";

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    throw new Error("No file uploaded");
  }

  const altText = formData.get("altText");
  const caption = formData.get("caption");

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const type = inferMediaType(mimeType);

  await createMedia({
    buffer,
    originalFilename: file.name,
    mimeType,
    type,
    altText: typeof altText === "string" ? altText : undefined,
    caption: typeof caption === "string" ? caption : undefined,
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?status=uploaded");
}

export default function MediaUploadPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Upload Media</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Upload images, documents, audio, or video files to the media library.
        </p>
      </div>

      <form
        action={uploadMedia}
        method="post"
        encType="multipart/form-data"
        className="space-y-4 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-4"
      >
        <div className="space-y-1">
          <label htmlFor="file" className="text-sm font-medium">
            File
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            className="block w-full text-sm"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Max size depends on server limits. Images will get thumbnails automatically.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="altText" className="text-sm font-medium">
              Alt text
            </label>
            <input
              id="altText"
              name="altText"
              type="text"
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              placeholder="Short description for accessibility"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="caption" className="text-sm font-medium">
              Caption
            </label>
            <input
              id="caption"
              name="caption"
              type="text"
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              placeholder="Optional caption"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
        >
          Upload
        </button>
      </form>
    </section>
  );
}
