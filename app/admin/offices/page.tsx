import {
  createOfficeAction,
  deleteOfficeAction,
  updateOfficeAction,
} from "./actions";
import { listOffices } from "@/lib/services/person-service";

export default async function AdminOfficesPage() {
  const offices = await listOffices();

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Offices</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage organisational offices used to group persons (for example, Board of Trustees,
          Traditional Council, Executives).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--color-foreground)]">Create office</h2>
          <form
            action={createOfficeAction}
            method="post"
            className="space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-4"
          >
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
                placeholder="e.g. Board of Trustees"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-sm"
                placeholder="How this office is described on the site"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
            >
              Add office
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--color-foreground)]">Existing offices</h2>
          {offices.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No offices defined yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-card)]">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offices.map((office) => {
                    const updateAction = updateOfficeAction.bind(null, office.id);
                    const deleteAction = deleteOfficeAction.bind(null, office.id);

                    return (
                      <tr key={office.id} className="border-t border-[var(--color-border)] text-xs">
                        <td className="px-3 py-2 align-top">
                          <form action={updateAction} method="post" className="space-y-1">
                            <input
                              type="text"
                              name="name"
                              defaultValue={office.name}
                              className="h-7 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
                            />
                            <textarea
                              name="description"
                              defaultValue={office.description ?? ""}
                              rows={2}
                              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-xs"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="submit"
                                className="inline-flex items-center rounded-md border border-[var(--color-border)] px-2 py-1 text-[0.7rem] font-medium hover:bg-[var(--color-muted)]/10"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        </td>
                        <td className="px-3 py-2 align-top" />
                        <td className="px-3 py-2 align-top text-right">
                          <form action={deleteAction} method="post" className="inline-block">
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-md border border-red-500 px-2 py-1 text-[0.7rem] font-medium text-red-600 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
