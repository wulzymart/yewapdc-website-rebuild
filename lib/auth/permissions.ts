export type UserRole = "ADMIN" | "EDITOR" | "AUTHOR" | "VIEWER";

export function canViewAdmin(role: UserRole): boolean {
  return role === "ADMIN" || role === "EDITOR" || role === "AUTHOR";
}

export function canEditArticle(role: UserRole): boolean {
  return role === "ADMIN" || role === "EDITOR" || role === "AUTHOR";
}

export function canPublish(role: UserRole): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageSettings(role: UserRole): boolean {
  return role === "ADMIN" || role === "EDITOR";
}
