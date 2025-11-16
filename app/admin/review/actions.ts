"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canPublish, type UserRole } from "@/lib/auth/permissions";
import {
  getArticleById,
  markArticleReviewed,
  sendBackArticleToDraft,
} from "@/lib/services/article-service";
import {
  getEventById,
  markEventReviewed,
  sendBackEventToDraft,
} from "@/lib/services/event-service";

async function requireReviewer() {
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

  if (!canPublish(role)) {
    redirect("/admin");
  }

  return { user: currentUser, role };
}

export async function approveArticleReviewAction(id: string) {
  const { user } = await requireReviewer();

  const existing = await getArticleById(id);
  if (!existing) {
    throw new Error("Article not found");
  }

  await markArticleReviewed(id, user.id);

  revalidatePath("/admin/articles");
  revalidatePath("/admin/review");
}

export async function sendBackArticleForChangesAction(id: string) {
  await requireReviewer();

  const existing = await getArticleById(id);
  if (!existing) {
    throw new Error("Article not found");
  }

  await sendBackArticleToDraft(id);

  revalidatePath("/admin/articles");
  revalidatePath("/admin/review");
}

export async function approveEventReviewAction(id: string) {
  const { user } = await requireReviewer();

  const existing = await getEventById(id);
  if (!existing) {
    throw new Error("Event not found");
  }

  await markEventReviewed(id, user.id);

  revalidatePath("/admin/events");
  revalidatePath("/admin/review");
}

export async function sendBackEventForChangesAction(id: string) {
  await requireReviewer();

  const existing = await getEventById(id);
  if (!existing) {
    throw new Error("Event not found");
  }

  await sendBackEventToDraft(id);

  revalidatePath("/admin/events");
  revalidatePath("/admin/review");
}
