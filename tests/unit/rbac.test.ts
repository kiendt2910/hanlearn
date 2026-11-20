import { describe, expect, it } from "vitest";
import {
  PERMISSIONS,
  canAccessAdminArea,
  canAccessSystemAdmin,
  hasPermission,
  hasRole,
  isOwnerOrAdmin,
} from "@/lib/permissions/rbac";

describe("RBAC permissions matrix", () => {
  it("grants LEARNER only learner access and denies CMS/system permissions", () => {
    const roles = ["LEARNER"];
    expect(hasRole(roles, "LEARNER")).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.LEARNER_ACCESS)).toBe(true);
    expect(canAccessAdminArea(roles)).toBe(false);
    expect(canAccessSystemAdmin(roles)).toBe(false);
    expect(hasPermission(roles, PERMISSIONS.CMS_CONTENT_WRITE)).toBe(false);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_USERS_MANAGE)).toBe(false);
  });

  it("grants CONTENT_EDITOR CMS content permissions but strictly denies system admin privileges", () => {
    const roles = ["CONTENT_EDITOR"];
    expect(canAccessAdminArea(roles)).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.CMS_CONTENT_WRITE)).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.CMS_CONTENT_PUBLISH)).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.CMS_IMPORT_EXPORT)).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.CMS_MEDIA_MANAGE)).toBe(true);

    // Crucial security requirement from Section 13:
    expect(canAccessSystemAdmin(roles)).toBe(false);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_USERS_MANAGE)).toBe(false);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_AI_CONFIG)).toBe(false);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_SYSTEM_SETTINGS)).toBe(false);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_AUDIT_LOGS)).toBe(false);
  });

  it("grants ADMIN full CMS and system administration permissions", () => {
    const roles = ["ADMIN"];
    expect(canAccessAdminArea(roles)).toBe(true);
    expect(canAccessSystemAdmin(roles)).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_USERS_MANAGE)).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_AI_CONFIG)).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_SYSTEM_SETTINGS)).toBe(true);
    expect(hasPermission(roles, PERMISSIONS.ADMIN_AUDIT_LOGS)).toBe(true);
  });

  it("enforces user-level data ownership isolation unless actor is ADMIN", () => {
    expect(isOwnerOrAdmin("user-a", "user-a", ["LEARNER"])).toBe(true);
    expect(isOwnerOrAdmin("user-a", "user-b", ["LEARNER"])).toBe(false);
    expect(isOwnerOrAdmin("user-a", "user-b", ["CONTENT_EDITOR"])).toBe(false);
    expect(isOwnerOrAdmin("admin-1", "user-b", ["ADMIN"])).toBe(true);
  });
});
