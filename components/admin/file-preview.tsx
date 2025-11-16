import type { MediaRecord } from "@/lib/services/media-service";

interface FilePreviewProps {
  item: MediaRecord;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let index = 0;
  let value = bytes;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(1)} ${units[index]}`;
}

export function FilePreview({ item }: FilePreviewProps) {
  const isImage = item.type === "IMAGE";
  const isVideo = item.type === "VIDEO";
  const isAudio = item.type === "AUDIO";

  return (
    <article className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-2 text-xs">
      <div className="aspect-video overflow-hidden rounded-md bg-[var(--color-muted)]">
        {isImage ? (
          <img
            src={item.thumbnailUrl ?? item.url}
            alt={item.altText ?? item.originalFilename}
            className="h-full w-full object-cover"
          />
        ) : isVideo ? (
          <video
            src={item.url}
            className="h-full w-full object-cover"
            controls
            muted
          >
            Your browser does not support the video tag.
          </video>
        ) : isAudio ? (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-muted-foreground)]">
            <span>audio</span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-muted-foreground)]">
            <span>{item.type.toLowerCase()}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="truncate font-medium">{item.originalFilename}</div>
        <div className="flex justify-between text-[0.7rem] text-[var(--color-muted)]">
          <span>{item.type}</span>
          {typeof item.size === "number" && <span>{formatFileSize(item.size)}</span>}
        </div>
      </div>
    </article>
  );
}
