import Link from "next/link";

import { deletePersonAction } from "./actions";
import { listOffices, listPersons, getPersonOffices } from "@/lib/services/person-service";

export default async function AdminPersonsPage() {
  const [people, offices] = await Promise.all([listPersons(), listOffices()]);

  const officeById = new Map(offices.map((office) => [office.id, office]));

  const assignmentsEntries = await Promise.all(
    people.map(async (person) => {
      const assignments = await getPersonOffices(person.id);
      return [person.id, assignments] as const;
    }),
  );
  const assignmentsByPersonId = new Map(assignmentsEntries);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Persons</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage people associated with the organisation and assign them to offices.
          </p>
        </div>
        <Link
          href="/admin/persons/new"
          className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
        >
          New person
        </Link>
      </div>

      {people.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No persons found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Offices</th>
                <th className="px-3 py-2">Photo</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => {
                const assignments = assignmentsByPersonId.get(person.id) ?? [];
                const officesLabel = assignments
                  .map((assignment) => {
                    const office = officeById.get(assignment.officeId);
                    if (!office) return "";
                    if (assignment.title) {
                      return `${office.name} (${assignment.title})`;
                    }
                    return office.name;
                  })
                  .filter(Boolean)
                  .join(", ");

                const deleteAction = deletePersonAction.bind(null, person.id);

                return (
                  <tr key={person.id} className="border-t border-[var(--color-border)] text-xs">
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium text-[var(--color-foreground)]">{person.fullName}</div>
                      {person.bio && (
                        <div className="mt-0.5 line-clamp-2 text-[0.7rem] text-[var(--color-muted)]">
                          {person.bio}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-[0.7rem] text-[var(--color-muted-foreground)]">
                      {officesLabel || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-[0.7rem] text-[var(--color-muted-foreground)]">
                      {person.photoId ? person.photoId : "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/admin/persons/${person.id}/edit`}
                          className="inline-flex items-center rounded-md border border-[var(--color-border)] px-2 py-1 text-[0.7rem] hover:bg-[var(--color-muted)]/10"
                        >
                          Edit
                        </Link>
                        <form action={deleteAction} method="post" className="inline-block">
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-md border border-red-500 px-2 py-1 text-[0.7rem] font-medium text-red-600 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
