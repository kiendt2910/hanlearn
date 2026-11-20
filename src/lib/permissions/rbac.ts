export type AppRole = "ADMIN" | "CONTENT_EDITOR" | "LEARNER";

export const PERMISSIONS = {
  LEARNER_ACCESS: "learner:access",
  CMS_DASHBOARD_VIEW: "cms:dashboard:view",
  CMS_CONTENT_WRITE: "cms:content:write",
  CMS_CONTENT_PUBLISH: "cms:content:publish",
  CMS_IMPORT_EXPORT: "cms:content:import_export",
  CMS_MEDIA_MANAGE: "cms:media:manage",
  ADMIN_USERS_MANAGE: "admin:users:manage",
  ADMIN_AI_CONFIG: "admin:ai:config",
  ADMIN_SYSTEM_SETTINGS: "admin:system:settings",
  ADMIN_AUDIT_LOGS: "admin:audit:logs",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSION_MATRIX: Record<AppRole, ReadonlySet<Permission>> = {
  LEARNER: new Set<Permission>([PERMISSIONS.LEARNER_ACCESS]),
  CONTENT_EDITOR: new Set<Permission>([
    PERMISSIONS.LEARNER_ACCESS,
    PERMISSIONS.CMS_DASHBOARD_VIEW,
    PERMISSIONS.CMS_CONTENT_WRITE,
    PERMISSIONS.CMS_CONTENT_PUBLISH,
    PERMISSIONS.CMS_IMPORT_EXPORT,
    PERMISSIONS.CMS_MEDIA_MANAGE,
  ]),
  ADMIN: new Set<Permission>([
    PERMISSIONS.LEARNER_ACCESS,
    PERMISSIONS.CMS_DASHBOARD_VIEW,
    PERMISSIONS.CMS_CONTENT_WRITE,
    PERMISSIONS.CMS_CONTENT_PUBLISH,
    PERMISSIONS.CMS_IMPORT_EXPORT,
    PERMISSIONS.CMS_MEDIA_MANAGE,
    PERMISSIONS.ADMIN_USERS_MANAGE,
    PERMISSIONS.ADMIN_AI_CONFIG,
    PERMISSIONS.ADMIN_SYSTEM_SETTINGS,
    PERMISSIONS.ADMIN_AUDIT_LOGS,
  ]),
};

export function hasRole(roles: readonly string[] | undefined, target: AppRole): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.includes(target);
}

export function hasPermission(
  roles: readonly string[] | undefined,
  permission: Permission
): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => {
    const perms = ROLE_PERMISSION_MATRIX[role as AppRole];
    return perms ? perms.has(permission) : false;
  });
}

export function canAccessAdminArea(roles: readonly string[] | undefined): boolean {
  return hasPermission(roles, PERMISSIONS.CMS_DASHBOARD_VIEW);
}

export function canAccessSystemAdmin(roles: readonly string[] | undefined): boolean {
  return (
    hasPermission(roles, PERMISSIONS.ADMIN_USERS_MANAGE) &&
    hasPermission(roles, PERMISSIONS.ADMIN_SYSTEM_SETTINGS)
  );
}

export function isOwnerOrAdmin(
  actorUserId: string,
  ownerUserId: string,
  roles: readonly string[] | undefined
): boolean {
  return actorUserId === ownerUserId || hasRole(roles, "ADMIN");
}
