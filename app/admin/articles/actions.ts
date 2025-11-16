"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { canEditArticle, canPublish, type UserRole } from "@/lib/auth/permissions";
import {
  createArticle,
  getArticleById,
  submitArticleForReview,
  softDeleteArticle,
  updateArticle,
  type ArticleStatus,
} from "@/lib/services/article-service";

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

function parseArticleStatus(value: FormDataEntryValue | null): ArticleStatus | undefined {
  if (typeof value !== "string") return undefined;
  if (value === "DRAFT" || value === "PUBLISHED" || value === "SCHEDULED") {
    return value;
  }
  return undefined;
}

export async function createArticleAction(formData: FormData) {
  const { user, role } = await requireCurrentUser();

  const title = formData.get("title");
  const content = formData.get("content");

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Title is required");
  }
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Content is required");
  }

  const status = parseArticleStatus(formData.get("status")) ?? "DRAFT";

  if (!canEditArticle(role)) {
    throw new Error("Not allowed to create articles");
  }

  if ((status === "PUBLISHED" || status === "SCHEDULED") && !canPublish(role)) {
    throw new Error("Not allowed to publish or schedule articles");
  }

  const excerpt = formData.get("excerpt");
  const categoryId = formData.get("categoryId");
  const featuredImageId = formData.get("featuredImageId");
  const seoTitle = formData.get("seoTitle");
  const seoDescription = formData.get("seoDescription");

  let publishedAt: Date | null | undefined;
  const publishedAtRaw = formData.get("publishedAt");
  if (typeof publishedAtRaw === "string" && publishedAtRaw) {
    const date = new Date(publishedAtRaw);
    if (!Number.isNaN(date.getTime())) publishedAt = date;
  }

  let scheduledAt: Date | null | undefined;
  const scheduledAtRaw = formData.get("scheduledAt");
  if (typeof scheduledAtRaw === "string" && scheduledAtRaw) {
    const date = new Date(scheduledAtRaw);
    if (!Number.isNaN(date.getTime())) scheduledAt = date;
  }

  await createArticle({
    title,
    content,
    excerpt: typeof excerpt === "string" ? excerpt || null : null,
    categoryId: typeof categoryId === "string" && categoryId ? categoryId : null,
    featuredImageId:
      typeof featuredImageId === "string" && featuredImageId ? featuredImageId : null,
    status,
    publishedAt: publishedAt ?? null,
    scheduledAt: scheduledAt ?? null,
    seoTitle: typeof seoTitle === "string" ? seoTitle || null : null,
    seoDescription:
      typeof seoDescription === "string" ? seoDescription || null : null,
    authorId: user.id,
    createdBy: user.id,
  });

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticleAction(id: string, formData: FormData) {
  const { user, role } = await requireCurrentUser();

  const intentRaw = formData.get("intent");
  const intent = typeof intentRaw === "string" ? intentRaw : "save";

  const existing = await getArticleById(id);
  if (!existing) {
    throw new Error("Article not found");
  }

  if (role === "AUTHOR" && existing.authorId !== user.id) {
    throw new Error("Not allowed to edit this article");
  }

  const status = parseArticleStatus(formData.get("status"));

  if (!canEditArticle(role)) {
    throw new Error("Not allowed to edit articles");
  }

  if (status && (status === "PUBLISHED" || status === "SCHEDULED") && !canPublish(role)) {
    throw new Error("Not allowed to publish or schedule articles");
  }

  const title = formData.get("title");
  const content = formData.get("content");
  const excerpt = formData.get("excerpt");
  const categoryId = formData.get("categoryId");
  const featuredImageId = formData.get("featuredImageId");
  const seoTitle = formData.get("seoTitle");
  const seoDescription = formData.get("seoDescription");

  let publishedAt: Date | null | undefined;
  const publishedAtRaw = formData.get("publishedAt");
  if (typeof publishedAtRaw === "string" && publishedAtRaw) {
    const date = new Date(publishedAtRaw);
    if (!Number.isNaN(date.getTime())) publishedAt = date;
  }

  let scheduledAt: Date | null | undefined;
  const scheduledAtRaw = formData.get("scheduledAt");
  if (typeof scheduledAtRaw === "string" && scheduledAtRaw) {
    const date = new Date(scheduledAtRaw);
    if (!Number.isNaN(date.getTime())) scheduledAt = date;
  }

  await updateArticle(id, {
    title: typeof title === "string" ? title : undefined,
    content: typeof content === "string" ? content : undefined,
    excerpt: typeof excerpt === "string" ? excerpt : undefined,
    categoryId: typeof categoryId === "string" ? categoryId : undefined,
    featuredImageId:
      typeof featuredImageId === "string" ? featuredImageId || null : undefined,
    status: status ?? undefined,
    publishedAt,
    scheduledAt,
    seoTitle: typeof seoTitle === "string" ? seoTitle : undefined,
    seoDescription: typeof seoDescription === "string" ? seoDescription : undefined,
    updatedBy: user.id,
  });

  if (intent === "submit") {
    if (role !== "AUTHOR") {
      throw new Error("Only authors can submit articles for review");
    }

    await submitArticleForReview(id, user.id);

    revalidatePath("/admin/articles");
    revalidatePath("/admin/review");
    redirect("/admin/review");
  }

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticleAction(id: string) {
  const { role } = await requireCurrentUser();

  if (!canPublish(role)) {
    throw new Error("Not allowed to delete articles");
  }

  await softDeleteArticle(id);
  revalidatePath("/admin/articles");
}
