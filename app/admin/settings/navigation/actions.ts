"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canManageSettings, type UserRole } from "@/lib/auth/permissions";
import {
  upsertNavigationMenu,
  type NavItem,
  type NavLocation,
} from "@/lib/services/settings-service";

async function requireCurrentUserWithRole() {
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

function parseLocation(raw: FormDataEntryValue | null): NavLocation {
  if (raw !== "HEADER" && raw !== "FOOTER") {
    throw new Error("Invalid navigation location");
  }
  return raw;
}

function parseItems(raw: FormDataEntryValue | null): NavItem[] {
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as NavItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      label: String(item.label ?? ""),
      url: String(item.url ?? "#"),
      external: Boolean(item.external),
      // Nested children can be supported later; for now keep a flat list.
    }));
  } catch {
    return [];
  }
}

export async function updateNavigationMenuAction(formData: FormData) {
  const { user, role } = await requireCurrentUserWithRole();

  if (!canManageSettings(role)) {
    throw new Error("Not allowed to manage navigation menus");
  }

  const location = parseLocation(formData.get("location"));
  const items = parseItems(formData.get("items"));

  await upsertNavigationMenu({
    location,
    items,
    updatedBy: user.id,
  });

  revalidatePath("/admin/settings/navigation");
  revalidatePath("/");

  redirect("/admin/settings/navigation?location=" + location);
}
