import { describe, it, expect } from "@jest/globals";

import {
  canEditArticle,
  canManageSettings,
  canManageUsers,
  canPublish,
  canViewAdmin,
  type UserRole,
} from "@/lib/auth/permissions";

const roles: UserRole[] = ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"];

describe("permissions", () => {
  it("defines who can view the admin area", () => {
    const matrix = new Map<UserRole, boolean>();
    for (const role of roles) {
      matrix.set(role, canViewAdmin(role));
    }

    expect(matrix.get("ADMIN")).toBe(true);
    expect(matrix.get("EDITOR")).toBe(true);
    expect(matrix.get("AUTHOR")).toBe(true);
    expect(matrix.get("VIEWER")).toBe(false);
  });

  it("defines who can edit articles", () => {
    const matrix = new Map<UserRole, boolean>();
    for (const role of roles) {
      matrix.set(role, canEditArticle(role));
    }

    expect(matrix.get("ADMIN")).toBe(true);
    expect(matrix.get("EDITOR")).toBe(true);
    expect(matrix.get("AUTHOR")).toBe(true);
    expect(matrix.get("VIEWER")).toBe(false);
  });

  it("defines who can publish content", () => {
    const matrix = new Map<UserRole, boolean>();
    for (const role of roles) {
      matrix.set(role, canPublish(role));
    }

    expect(matrix.get("ADMIN")).toBe(true);
    expect(matrix.get("EDITOR")).toBe(true);
    expect(matrix.get("AUTHOR")).toBe(false);
    expect(matrix.get("VIEWER")).toBe(false);
  });

  it("defines who can manage users", () => {
    const matrix = new Map<UserRole, boolean>();
    for (const role of roles) {
      matrix.set(role, canManageUsers(role));
    }

    expect(matrix.get("ADMIN")).toBe(true);
    expect(matrix.get("EDITOR")).toBe(false);
    expect(matrix.get("AUTHOR")).toBe(false);
    expect(matrix.get("VIEWER")).toBe(false);
  });

  it("defines who can manage settings", () => {
    const matrix = new Map<UserRole, boolean>();
    for (const role of roles) {
      matrix.set(role, canManageSettings(role));
    }

    expect(matrix.get("ADMIN")).toBe(true);
    expect(matrix.get("EDITOR")).toBe(true);
    expect(matrix.get("AUTHOR")).toBe(false);
    expect(matrix.get("VIEWER")).toBe(false);
  });
});
