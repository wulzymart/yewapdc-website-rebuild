import { db, pool } from "@/lib/db/drizzle";
import { offices, personOffices, persons } from "@/db/schema";

export type PersonRecord = typeof persons.$inferSelect;
export type OfficeRecord = typeof offices.$inferSelect;
export type PersonOfficeRecord = typeof personOffices.$inferSelect;

export interface PersonOfficeAssignmentInput {
  officeId: string;
  title?: string | null;
}

export interface CreatePersonInput {
  firstName: string;
  lastName: string;
  bio?: string | null;
  photoId?: string | null;
  createdBy?: string | null;
  officeAssignments?: PersonOfficeAssignmentInput[];
}

export interface UpdatePersonInput {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  photoId?: string | null;
  updatedBy?: string | null;
  officeAssignments?: PersonOfficeAssignmentInput[];
}

export interface ListPersonsFilter {
  search?: string;
  officeId?: string;
}

export async function createPerson(input: CreatePersonInput): Promise<PersonRecord> {
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  const [created] = await db
    .insert(persons)
    .values({
      firstName: input.firstName,
      lastName: input.lastName,
      fullName,
      bio: input.bio ?? null,
      photoId: input.photoId ?? null,
      createdBy: input.createdBy ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create person");
  }

  const assignments = input.officeAssignments ?? [];
  if (assignments.length > 0) {
    await db.insert(personOffices).values(
      assignments.map((assignment) => ({
        personId: created.id,
        officeId: assignment.officeId,
        title: assignment.title ?? null,
      })),
    );
  }

  return created;
}

export async function getPersonById(id: string): Promise<PersonRecord | null> {
  const rows = await db.select().from(persons);
  const row = rows.find((item) => item.id === id && !item.deletedAt);
  return row ?? null;
}

export async function listPersons(filter: ListPersonsFilter = {}): Promise<PersonRecord[]> {
  const people = await db.select().from(persons);

  const term = filter.search?.trim().toLowerCase() ?? "";

  let filtered = people.filter((person) => !person.deletedAt);

  if (term) {
    filtered = filtered.filter((person) => {
      const haystack = [person.firstName, person.lastName, person.fullName, person.bio]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  if (filter.officeId) {
    const assignments = await db.select().from(personOffices);
    const allowedIds = new Set(
      assignments.filter((a) => a.officeId === filter.officeId).map((a) => a.personId),
    );
    filtered = filtered.filter((person) => allowedIds.has(person.id));
  }

  return filtered;
}

export async function updatePerson(id: string, input: UpdatePersonInput): Promise<PersonRecord> {
  const existing = await getPersonById(id);
  if (!existing) {
    throw new Error("Person not found");
  }

  let firstName = existing.firstName;
  let lastName = existing.lastName;

  if (input.firstName !== undefined) firstName = input.firstName;
  if (input.lastName !== undefined) lastName = input.lastName;

  const fullName = `${firstName} ${lastName}`.trim();

  const setFragments: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 2; // $1 reserved for id

  const addSet = (column: string, value: unknown) => {
    setFragments.push(`"${column}" = $${paramIndex}`);
    params.push(value);
    paramIndex += 1;
  };

  if (input.firstName !== undefined) addSet("first_name", input.firstName);
  if (input.lastName !== undefined) addSet("last_name", input.lastName);
  addSet("full_name", fullName);
  if (input.bio !== undefined) addSet("bio", input.bio);
  if (input.photoId !== undefined) addSet("photo_id", input.photoId);
  if (input.updatedBy !== undefined) addSet("updated_by", input.updatedBy);

  // Always bump updated_at
  setFragments.push('"updated_at" = now()');

  const sql = `update "persons" set ${setFragments.join(", ")} where "id" = $1 returning *`;
  const result = await pool.query(sql, [id, ...params]);
  const row = (result.rows[0] as PersonRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to update person");
  }

  if (input.officeAssignments) {
    await setPersonOffices(id, input.officeAssignments);
  }

  return row;
}

export async function softDeletePerson(id: string): Promise<void> {
  const result = await pool.query(
    'update "persons" set "deleted_at" = now() where "id" = $1',
    [id],
  );

  if (result.rowCount === 0) {
    throw new Error("Failed to delete person");
  }
}

export async function getPersonOffices(
  personId: string,
): Promise<PersonOfficeRecord[]> {
  const rows = await db.select().from(personOffices);
  return rows.filter((row) => row.personId === personId);
}

export async function setPersonOffices(
  personId: string,
  assignments: PersonOfficeAssignmentInput[],
): Promise<void> {
  await pool.query('delete from "person_offices" where "person_id" = $1', [personId]);

  if (assignments.length === 0) return;

  await db.insert(personOffices).values(
    assignments.map((assignment) => ({
      personId,
      officeId: assignment.officeId,
      title: assignment.title ?? null,
    })),
  );
}

export async function listOffices(): Promise<OfficeRecord[]> {
  const rows = await db.select().from(offices);
  return rows;
}

export interface CreateOfficeInput {
  name: string;
  description?: string | null;
}

export interface UpdateOfficeInput {
  name?: string;
  description?: string | null;
}

export async function createOffice(input: CreateOfficeInput): Promise<OfficeRecord> {
  const [created] = await db
    .insert(offices)
    .values({
      name: input.name,
      description: input.description ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create office");
  }

  return created;
}

export async function getOfficeById(id: string): Promise<OfficeRecord | null> {
  const rows = await db.select().from(offices);
  const row = rows.find((item) => item.id === id);
  return row ?? null;
}

export async function updateOffice(id: string, input: UpdateOfficeInput): Promise<OfficeRecord> {
  const existing = await getOfficeById(id);
  if (!existing) {
    throw new Error("Office not found");
  }

  const setFragments: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 2; // $1 reserved for id

  const addSet = (column: string, value: unknown) => {
    setFragments.push(`"${column}" = $${paramIndex}`);
    params.push(value);
    paramIndex += 1;
  };

  if (input.name !== undefined) addSet("name", input.name);
  if (input.description !== undefined) addSet("description", input.description);

  // Always bump updated_at
  setFragments.push('"updated_at" = now()');

  const sql = `update "offices" set ${setFragments.join(", ")} where "id" = $1 returning *`;
  const result = await pool.query(sql, [id, ...params]);
  const row = (result.rows[0] as OfficeRecord | undefined) ?? null;

  if (!row) {
    throw new Error("Failed to update office");
  }

  return row;
}

export async function deleteOffice(id: string): Promise<void> {
  await pool.query('delete from "offices" where "id" = $1', [id]);
}
