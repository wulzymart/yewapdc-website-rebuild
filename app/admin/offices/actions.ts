"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canManageSettings, type UserRole } from "@/lib/auth/permissions";
import { createOffice, deleteOffice, updateOffice } from "@/lib/services/person-service";

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

export async function createOfficeAction(formData: FormData) {
  const { role } = await requireCurrentUser();

  if (!canManageSettings(role)) {
    throw new Error("Not allowed to manage offices");
  }

  const name = formData.get("name");
  const description = formData.get("description");

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Name is required");
  }

  await createOffice({
    name: name.trim(),
    description: typeof description === "string" ? description || null : null,
  });

  revalidatePath("/admin/offices");
  redirect("/admin/offices");
}

export async function updateOfficeAction(id: string, formData: FormData) {
  const { role } = await requireCurrentUser();

  if (!canManageSettings(role)) {
    throw new Error("Not allowed to manage offices");
  }

  const name = formData.get("name");
  const description = formData.get("description");

  await updateOffice(id, {
    name: typeof name === "string" ? name : undefined,
    description: typeof description === "string" ? description : undefined,
  });

  revalidatePath("/admin/offices");
  redirect("/admin/offices");
}

export async function deleteOfficeAction(id: string) {
  const { role } = await requireCurrentUser();

  if (!canManageSettings(role)) {
    throw new Error("Not allowed to delete offices");
  }

  await deleteOffice(id);
  revalidatePath("/admin/offices");
}
