import { NextRequest } from "next/server";
import { ContentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUserPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";
import { logAdminAudit } from "@/modules/administration/audit.service";

const statusSchema = z.object({
  entityType: z.enum(["lesson", "course", "vocabulary", "grammar", "exam"]),
  entityId: z.string().uuid(),
  status: z.nativeEnum(ContentStatus),
});

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireUserPermission(PERMISSIONS.CMS_CONTENT_PUBLISH);
    const body = statusSchema.parse(await request.json());

    let updated: unknown;
    switch (body.entityType) {
      case "lesson":
        updated = await prisma.lesson.update({
          where: { id: body.entityId },
          data: {
            status: body.status,
            publishedAt: body.status === "PUBLISHED" ? new Date() : undefined,
          },
        });
        break;
      case "course":
        updated = await prisma.course.update({
          where: { id: body.entityId },
          data: { status: body.status },
        });
        break;
      case "vocabulary":
        updated = await prisma.vocabulary.update({
          where: { id: body.entityId },
          data: { status: body.status },
        });
        break;
      case "grammar":
        updated = await prisma.grammarPoint.update({
          where: { id: body.entityId },
          data: { status: body.status },
        });
        break;
      case "exam":
        updated = await prisma.examTemplate.update({
          where: { id: body.entityId },
          data: { status: body.status },
        });
        break;
      default:
        throw new AppError("Loại nội dung không hợp lệ.", 400);
    }

    await logAdminAudit({
      actorId: actor.id,
      action: body.status === "PUBLISHED" ? "PUBLISH" : body.status === "ARCHIVED" ? "ARCHIVE" : "UPDATE",
      entityType: body.entityType,
      entityId: body.entityId,
      afterData: { status: body.status },
    });

    return apiOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
