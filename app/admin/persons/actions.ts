"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canManageSettings, type UserRole } from "@/lib/auth/permissions";
import {
  createPerson,
  softDeletePerson,
  updatePerson,
  type PersonOfficeAssignmentInput,
} from "@/lib/services/person-service";

async function requireCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const allUsers = await db.select().from(users);
  const currentUser = allUsers.find((u) => u.id === session.user.id);
  const role = (currentUser?.role ?? "VIEWER") as UserRole;

  if (!currentUser) {
    redirect("/login");
  }

  return { user: currentUser, role };
}

function parseOfficeAssignments(formData: FormData): PersonOfficeAssignmentInput[] {
  const rawIds = formData.getAll("officeIds");
  const ids = rawIds.filter((value): value is string => typeof value === "string");

  const assignments: PersonOfficeAssignmentInput[] = [];
  for (const officeId of ids) {
    if (!officeId) continue;
    const titleValue = formData.get(`officeTitle-${officeId}`);
    const title =
      typeof titleValue === "string" && titleValue.trim() ? titleValue.trim() : null;
    assignments.push({ officeId, title });
  }

  return assignments;
}

export async function createPersonAction(formData: FormData) {
  const { user, role } = await requireCurrentUser();

  if (!canManageSettings(role)) {
    throw new Error("Not allowed to manage persons");
  }

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const bio = formData.get("bio");
  const photoId = formData.get("photoId");

  if (typeof firstName !== "string" || !firstName.trim()) {
    throw new Error("First name is required");
  }
  if (typeof lastName !== "string" || !lastName.trim()) {
    throw new Error("Last name is required");
  }

  const officeAssignments = parseOfficeAssignments(formData);

  await createPerson({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    bio: typeof bio === "string" ? bio || null : null,
    photoId: typeof photoId === "string" && photoId ? photoId : null,
    createdBy: user.id,
    officeAssignments,
  });

  revalidatePath("/admin/persons");
  redirect("/admin/persons");
}

export async function updatePersonAction(id: string, formData: FormData) {
  const { user, role } = await requireCurrentUser();

  if (!canManageSettings(role)) {
    throw new Error("Not allowed to manage persons");
  }

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const bio = formData.get("bio");
  const photoId = formData.get("photoId");

  const officeAssignments = parseOfficeAssignments(formData);

  await updatePerson(id, {
    firstName: typeof firstName === "string" ? firstName : undefined,
    lastName: typeof lastName === "string" ? lastName : undefined,
    bio: typeof bio === "string" ? bio : undefined,
    photoId:
      typeof photoId === "string" ? (photoId ? photoId : null) : undefined,
    updatedBy: user.id,
    officeAssignments,
  });

  revalidatePath("/admin/persons");
  redirect("/admin/persons");
}

export async function deletePersonAction(id: string) {
  const { role } = await requireCurrentUser();

  if (!canManageSettings(role)) {
    throw new Error("Not allowed to delete persons");
  }

  await softDeletePerson(id);
  revalidatePath("/admin/persons");
}
