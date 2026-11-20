import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUserPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { logAdminAudit } from "@/modules/administration/audit.service";

const settingSchema = z.object({
  key: z.string().trim().min(2).max(100),
  value: z.record(z.string(), z.unknown()),
  description: z.string().trim().max(240).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireUserPermission(PERMISSIONS.ADMIN_SYSTEM_SETTINGS);
    const body = settingSchema.parse(await request.json());

    const updated = await prisma.systemSetting.upsert({
      where: { key: body.key },
      update: {
        value: body.value as never,
        description: body.description,
        updatedById: actor.id,
      },
      create: {
        key: body.key,
        value: body.value as never,
        isSecret: false,
        description: body.description,
        updatedById: actor.id,
      },
    });

    await logAdminAudit({
      actorId: actor.id,
      action: "CONFIG_UPDATE",
      entityType: "system_setting",
      entityId: body.key,
      afterData: body.value,
    });

    return apiOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
