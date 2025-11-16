"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canEditArticle, canPublish, type UserRole } from "@/lib/auth/permissions";
import {
  createEvent,
  getEventById,
  submitEventForReview,
  softDeleteEvent,
  updateEvent,
  type EventStatus,
} from "@/lib/services/event-service";

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

function parseEventStatus(value: FormDataEntryValue | null): EventStatus | undefined {
  if (typeof value !== "string") return undefined;
  if (value === "DRAFT" || value === "PUBLISHED") return value;
  return undefined;
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

export async function createEventAction(formData: FormData) {
  const { user, role } = await requireCurrentUser();

  const intentRaw = formData.get("intent");
  const intent = typeof intentRaw === "string" ? intentRaw : "save";

  const title = formData.get("title");
  const description = formData.get("description");
  const startRaw = formData.get("startDate");
  const endRaw = formData.get("endDate");

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Title is required");
  }
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Description is required");
  }

  const startDate = parseRequiredDate(startRaw, "Start date");
  const endDate = parseRequiredDate(endRaw, "End date");
  if (endDate < startDate) {
    throw new Error("End date must be after start date");
  }

  let status = parseEventStatus(formData.get("status")) ?? "DRAFT";

  if (role === "AUTHOR") {
    status = "DRAFT";
  }

  if (!canEditArticle(role)) {
    throw new Error("Not allowed to create events");
  }
  if (status === "PUBLISHED" && !canPublish(role)) {
    throw new Error("Not allowed to publish events");
  }

  const location = formData.get("location");
  const categoryId = formData.get("categoryId");
  const seoTitle = formData.get("seoTitle");
  const seoDescription = formData.get("seoDescription");

  const created = await createEvent({
    title,
    description,
    startDate,
    endDate,
    status,
    location: typeof location === "string" ? location || null : null,
    categoryId: typeof categoryId === "string" && categoryId ? categoryId : null,
    seoTitle: typeof seoTitle === "string" ? seoTitle || null : null,
    seoDescription:
      typeof seoDescription === "string" ? seoDescription || null : null,
    createdBy: user.id,
  });

  if (intent === "submit" && role === "AUTHOR") {
    await submitEventForReview(created.id, user.id);

    revalidatePath("/admin/events");
    revalidatePath("/admin/review");
    redirect("/admin/review");
  }

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEventAction(id: string, formData: FormData) {
  const { user, role } = await requireCurrentUser();

  const intentRaw = formData.get("intent");
  const intent = typeof intentRaw === "string" ? intentRaw : "save";

  const existing = await getEventById(id);
  if (!existing) {
    throw new Error("Event not found");
  }

  if (role === "AUTHOR" && existing.createdBy && existing.createdBy !== user.id) {
    throw new Error("Not allowed to edit this event");
  }

  const status = parseEventStatus(formData.get("status"));

  if (!canEditArticle(role)) {
    throw new Error("Not allowed to edit events");
  }
  if (status === "PUBLISHED" && !canPublish(role)) {
    throw new Error("Not allowed to publish events");
  }

  const title = formData.get("title");
  const description = formData.get("description");
  const location = formData.get("location");
  const categoryId = formData.get("categoryId");
  const seoTitle = formData.get("seoTitle");
  const seoDescription = formData.get("seoDescription");
  const startRaw = formData.get("startDate");
  const endRaw = formData.get("endDate");

  const startDate = parseOptionalDate(startRaw);
  const endDate = parseOptionalDate(endRaw);
  if (startDate && endDate && endDate < startDate) {
    throw new Error("End date must be after start date");
  }

  await updateEvent(id, {
    title: typeof title === "string" ? title : undefined,
    description: typeof description === "string" ? description : undefined,
    location: typeof location === "string" ? location : undefined,
    categoryId: typeof categoryId === "string" ? categoryId : undefined,
    status: status ?? undefined,
    startDate,
    endDate,
    seoTitle: typeof seoTitle === "string" ? seoTitle : undefined,
    seoDescription: typeof seoDescription === "string" ? seoDescription : undefined,
    updatedBy: user.id,
  });

  if (intent === "submit") {
    if (role !== "AUTHOR") {
      throw new Error("Only authors can submit events for review");
    }

    await submitEventForReview(id, user.id);

    revalidatePath("/admin/events");
    revalidatePath("/admin/review");
    redirect("/admin/review");
  }

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEventAction(id: string) {
  const { role } = await requireCurrentUser();

  if (!canPublish(role)) {
    throw new Error("Not allowed to delete events");
  }

  await softDeleteEvent(id);
  revalidatePath("/admin/events");
}
