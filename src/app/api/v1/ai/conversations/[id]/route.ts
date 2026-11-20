import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;

    const existing = await prisma.aiConversation.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!existing) {
      throw new AppError("Không tìm thấy cuộc trò chuyện.", 404, "CONVERSATION_NOT_FOUND");
    }

    await prisma.aiConversation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return apiOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
