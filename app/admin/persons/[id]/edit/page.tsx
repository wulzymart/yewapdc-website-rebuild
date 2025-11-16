import Link from "next/link";
import { notFound } from "next/navigation";

import { OfficeSelector } from "@/components/admin/office-selector";
import { listMedia } from "@/lib/services/media-service";
import {
  getPersonById,
  getPersonOffices,
  listOffices,
} from "@/lib/services/person-service";
import {
  deletePersonAction,
  updatePersonAction,
} from "../../actions";

interface EditPersonPageProps {
  params: { id: string };
}

export default async function EditPersonPage({ params }: EditPersonPageProps) {
  const person = await getPersonById(params.id);

  if (!person) {
    notFound();
  }

  const [offices, assignments, images] = await Promise.all([
    listOffices(),
    getPersonOffices(person.id),
    listMedia({ type: "IMAGE" }),
  ]);

  const selectedAssignments = assignments.map((assignment) => ({
    officeId: assignment.officeId,
    title: assignment.title,
  }));

  const updateAction = updatePersonAction.bind(null, person.id);
  const deleteAction = deletePersonAction.bind(null, person.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Edit Person</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Update this person's details and office assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/persons"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-muted)]/10"
          >
            Back to list
          </Link>
          <form action={deleteAction} method="post" className="inline-block">
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-red-500 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10"
            >
              Delete person
            </button>
          </form>
        </div>
      </div>

      <form
        action={updateAction}
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
              defaultValue={person.firstName}
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
              defaultValue={person.lastName}
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
            defaultValue={person.bio ?? ""}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
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
              defaultValue={person.photoId ?? ""}
            >
              <option value="">No photo</option>
              {images.map((image) => (
                <option key={image.id} value={image.id}>
                  {image.originalFilename}
                </option>
              ))}
            </select>
          </div>

          <OfficeSelector offices={offices} selectedAssignments={selectedAssignments} />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
          >
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}
