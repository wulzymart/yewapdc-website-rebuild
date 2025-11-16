import { createPersonAction } from "../actions";
import { OfficeSelector } from "@/components/admin/office-selector";
import { listOffices } from "@/lib/services/person-service";
import { listMedia } from "@/lib/services/media-service";

export default async function NewPersonPage() {
  const [offices, images] = await Promise.all([
    listOffices(),
    listMedia({ type: "IMAGE" }),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">New Person</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Create a person record and assign them to one or more offices.
        </p>
      </div>

      <form
        action={createPersonAction}
        method="post"
        className="space-y-4 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="firstName"
              className="text-xs font-medium text-[var(--color-muted-foreground)]"
            >
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="lastName"
              className="text-xs font-medium text-[var(--color-muted-foreground)]"
            >
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="bio" className="text-xs font-medium text-[var(--color-muted-foreground)]">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
            placeholder="Short biography or description for this person"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="photoId"
              className="text-xs font-medium text-[var(--color-muted-foreground)]"
            >
              Photo
            </label>
            <select
              id="photoId"
              name="photoId"
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              defaultValue=""
            >
              <option value="">No photo</option>
              {images.map((image) => (
                <option key={image.id} value={image.id}>
                  {image.originalFilename}
                </option>
              ))}
            </select>
            <p className="text-[0.7rem] text-[var(--color-muted)]">
              Upload new photos in the Media library, then select them here.
            </p>
          </div>

          <OfficeSelector offices={offices} />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
          >
            Create person
          </button>
        </div>
      </form>
    </section>
  );
}
