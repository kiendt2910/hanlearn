import { prisma } from "@/lib/db/prisma";

export async function logAdminAudit(params: {
  actorId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "ARCHIVE" | "IMPORT" | "ROLE_CHANGE" | "CONFIG_UPDATE";
  entityType: string;
  entityId: string;
  beforeData?: unknown;
  afterData?: unknown;
  ipAddress?: string | null;
}) {
  await prisma.contentAuditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      beforeData: (params.beforeData ?? undefined) as never,
      afterData: (params.afterData ?? undefined) as never,
      ipAddress: params.ipAddress ?? null,
    },
  });
}
