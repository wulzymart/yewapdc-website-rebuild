"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canManageSettings, type UserRole } from "@/lib/auth/permissions";
import { upsertSetting, type SettingType } from "@/lib/services/settings-service";

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

export async function updateSiteSettingsAction(formData: FormData) {
  const { user, role } = await requireCurrentUserWithRole();

  if (!canManageSettings(role)) {
    throw new Error("Not allowed to manage site settings");
  }

  const fields: { key: string; formKey: string; type: SettingType }[] = [
    { key: "site.name", formKey: "siteName", type: "STRING" },
    { key: "site.tagline", formKey: "siteTagline", type: "TEXT" },
    { key: "site.contact.email", formKey: "siteContactEmail", type: "STRING" },
    { key: "site.contact.phone", formKey: "siteContactPhone", type: "STRING" },
    { key: "site.contact.address", formKey: "siteContactAddress", type: "TEXT" },
    { key: "site.social.facebook", formKey: "socialFacebook", type: "STRING" },
    { key: "site.social.twitter", formKey: "socialTwitter", type: "STRING" },
    { key: "site.social.instagram", formKey: "socialInstagram", type: "STRING" },
  ];

  const tasks = fields.map(({ key, formKey, type }) => {
    const raw = formData.get(formKey);
    const value = typeof raw === "string" ? raw : "";
    return upsertSetting({
      key,
      value,
      type,
      updatedBy: user.id,
    });
  });

  await Promise.all(tasks);

  revalidatePath("/admin/settings");
  revalidatePath("/");

  redirect("/admin/settings");
}
