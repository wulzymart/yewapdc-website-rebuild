"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canPublish, type UserRole } from "@/lib/auth/permissions";
import {
  createPromotion,
  softDeletePromotion,
  updatePromotion,
  type PromotionPosition,
} from "@/lib/services/promotion-service";

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

function parsePosition(value: FormDataEntryValue | null): PromotionPosition {
  if (typeof value !== "string") {
    throw new Error("Position is required");
  }
  if (value === "HERO" || value === "SIDEBAR" || value === "FOOTER" || value === "BANNER" || value === "POPUP") {
    return value;
  }
  throw new Error("Invalid promotion position");
}

function parseRequiredDate(value: FormDataEntryValue | null, field: string): Date {
  if (typeof value !== "string" || !value) {
    throw new Error(`${field} is required`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} is invalid`);
  }
  return date;
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function parseOptionalBoolean(value: FormDataEntryValue | null): boolean | undefined {
  if (typeof value !== "string") return undefined;
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

export async function createPromotionAction(formData: FormData) {
  const { user, role } = await requireCurrentUser();

  if (!canPublish(role)) {
    throw new Error("Not allowed to manage promotions");
  }

  const title = formData.get("title");
  const content = formData.get("content");

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Title is required");
  }
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Content is required");
  }

  const startDate = parseRequiredDate(formData.get("startDate"), "Start date");
  const endDate = parseRequiredDate(formData.get("endDate"), "End date");
  if (endDate < startDate) {
    throw new Error("End date must be after start date");
  }

  const position = parsePosition(formData.get("position"));

  const mediaId = formData.get("mediaId");
  const ctaText = formData.get("ctaText");
  const ctaLink = formData.get("ctaLink");
  const priorityRaw = formData.get("priority");

  let priority: number | undefined;
  if (typeof priorityRaw === "string" && priorityRaw.trim()) {
    const parsed = Number(priorityRaw);
    if (!Number.isNaN(parsed)) {
      priority = parsed;
    }
  }

  await createPromotion({
    title,
    content,
    mediaId: typeof mediaId === "string" && mediaId ? mediaId : null,
    ctaText: typeof ctaText === "string" ? ctaText || null : null,
    ctaLink: typeof ctaLink === "string" ? ctaLink || null : null,
    startDate,
    endDate,
    priority,
    position,
    createdBy: user.id,
  });

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}

export async function updatePromotionAction(id: string, formData: FormData) {
  const { user, role } = await requireCurrentUser();

  if (!canPublish(role)) {
    throw new Error("Not allowed to manage promotions");
  }

  const title = formData.get("title");
  const content = formData.get("content");
  const mediaId = formData.get("mediaId");
  const ctaText = formData.get("ctaText");
  const ctaLink = formData.get("ctaLink");
  const startRaw = formData.get("startDate");
  const endRaw = formData.get("endDate");
  const positionRaw = formData.get("position");
  const priorityRaw = formData.get("priority");
  const isActiveRaw = formData.get("isActive");

  const startDate = parseOptionalDate(startRaw);
  const endDate = parseOptionalDate(endRaw);
  if (startDate && endDate && endDate < startDate) {
    throw new Error("End date must be after start date");
  }

  const position =
    positionRaw && typeof positionRaw === "string"
      ? parsePosition(positionRaw)
      : undefined;

  let priority: number | undefined;
  if (typeof priorityRaw === "string" && priorityRaw.trim()) {
    const parsed = Number(priorityRaw);
    if (!Number.isNaN(parsed)) {
      priority = parsed;
    }
  }

  const isActive = parseOptionalBoolean(isActiveRaw);

  await updatePromotion(id, {
    title: typeof title === "string" ? title : undefined,
    content: typeof content === "string" ? content : undefined,
    mediaId: typeof mediaId === "string" ? mediaId : undefined,
    ctaText: typeof ctaText === "string" ? ctaText : undefined,
    ctaLink: typeof ctaLink === "string" ? ctaLink : undefined,
    startDate,
    endDate,
    position,
    priority,
    isActive,
    updatedBy: user.id,
  });

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}

export async function deletePromotionAction(id: string) {
  const { role } = await requireCurrentUser();

  if (!canPublish(role)) {
    throw new Error("Not allowed to delete promotions");
  }

  await softDeletePromotion(id);
  revalidatePath("/admin/promotions");
}
