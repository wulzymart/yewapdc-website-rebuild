"use client";

interface ImageEditorControlsProps {
  /**
   * Optional heading override; defaults to "Image options".
   */
  title?: string;
}

export function ImageEditorControls({ title = "Image options" }: ImageEditorControlsProps) {
  return (
    <fieldset className="space-y-2 rounded-md border border-dashed border-[var(--color-border)] p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {title}
      </legend>
      <p className="text-xs text-[var(--color-muted)]">
        Basic image adjustments are applied on upload. For non-image files, these options are ignored.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="maxWidth" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Max width (px)
          </label>
          <input
            id="maxWidth"
            name="maxWidth"
            type="number"
            min={0}
            placeholder="e.g. 1600"
            className="h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
          />
          <p className="text-[0.7rem] text-[var(--color-muted)]">Leave empty to keep original width.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="squareCrop"
            name="squareCrop"
            type="checkbox"
            className="h-3 w-3 rounded border border-[var(--color-border)]"
          />
          <label htmlFor="squareCrop" className="text-xs text-[var(--color-muted-foreground)]">
            Square crop (uses max width)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="generateVariants"
            name="generateVariants"
            type="checkbox"
            defaultChecked
            className="h-3 w-3 rounded border border-[var(--color-border)]"
          />
          <label htmlFor="generateVariants" className="text-xs text-[var(--color-muted-foreground)]">
            Generate responsive variants
          </label>
        </div>
      </div>
    </fieldset>
  );
}
