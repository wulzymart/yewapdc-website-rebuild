import type { OfficeRecord } from "@/lib/services/person-service";

interface OfficeSelectorProps {
  offices: OfficeRecord[];
  selectedAssignments?: { officeId: string; title?: string | null }[];
  /**
   * Optional field name prefix to support multiple selectors in a single form.
   * Defaults to "office" and results in fields like "officeIds" and
   * "officeTitle-<officeId>".
   */
  namePrefix?: string;
}

export function OfficeSelector({
  offices,
  selectedAssignments = [],
  namePrefix = "office",
}: OfficeSelectorProps) {
  const selectedIds = new Set(selectedAssignments.map((a) => a.officeId));
  const titleByOfficeId: Record<string, string> = {};
  for (const assignment of selectedAssignments) {
    if (assignment.officeId) {
      titleByOfficeId[assignment.officeId] = assignment.title ?? "";
    }
  }

  const idsField = `${namePrefix}Ids`;
  const titleFieldPrefix = `${namePrefix}Title-`;

  return (
    <fieldset className="space-y-2 rounded-md border border-[var(--color-border)] p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Offices
      </legend>
      {offices.length === 0 ? (
        <p className="text-xs text-[var(--color-muted)]">
          No offices defined yet. Create offices in the Offices admin page.
        </p>
      ) : (
        <div className="space-y-2">
          {offices.map((office) => (
            <div
              key={office.id}
              className="flex flex-col gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1.5"
            >
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name={idsField}
                  value={office.id}
                  defaultChecked={selectedIds.has(office.id)}
                  className="h-3 w-3 rounded border border-[var(--color-border)]"
                />
                <span className="font-medium">{office.name}</span>
              </label>
              <input
                type="text"
                name={`${titleFieldPrefix}${office.id}`}
                defaultValue={titleByOfficeId[office.id] ?? ""}
                placeholder="Optional title for this person in this office"
                className="h-7 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-[0.7rem]"
              />
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}
