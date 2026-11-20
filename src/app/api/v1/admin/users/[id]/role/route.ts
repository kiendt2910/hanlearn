import { NextRequest } from "next/server";
import { RoleCode } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUserPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";
import { logAdminAudit } from "@/modules/administration/audit.service";

const roleUpdateSchema = z.object({
  roleCode: z.nativeEnum(RoleCode),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireUserPermission(PERMISSIONS.ADMIN_USERS_MANAGE);
    const { id: targetUserId } = await context.params;
    const body = roleUpdateSchema.parse(await request.json());

    const role = await prisma.role.findUnique({ where: { code: body.roleCode } });
    if (!role) throw new AppError("Vai trò không tồn tại.", 400);

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: targetUserId } });
      await tx.userRole.create({ data: { userId: targetUserId, roleId: role.id } });
      if (body.isActive !== undefined) {
        await tx.user.update({
          where: { id: targetUserId },
          data: { isActive: body.isActive },
        });
      }
    });

    await logAdminAudit({
      actorId: actor.id,
      action: "ROLE_CHANGE",
      entityType: "user",
      entityId: targetUserId,
      afterData: { roleCode: body.roleCode, isActive: body.isActive },
    });

    return apiOk({ userId: targetUserId, roleCode: body.roleCode });
  } catch (error) {
    return handleApiError(error);
  }
}
