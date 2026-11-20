import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";

const updateCardSchema = z.object({
  deckId: z.string().uuid().optional(),
  frontZh: z.string().trim().min(1).optional(),
  frontPinyin: z.string().trim().nullable().optional(),
  backVi: z.string().trim().min(1).optional(),
  exampleZh: z.string().trim().nullable().optional(),
  exampleVi: z.string().trim().nullable().optional(),
  notesVi: z.string().trim().nullable().optional(),
  isSuspended: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const body = updateCardSchema.parse(await request.json());

    const existing = await prisma.flashcard.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!existing) {
      throw new AppError("Không tìm thấy thẻ Flashcard.", 404, "FLASHCARD_NOT_FOUND");
    }

    if (body.deckId) {
      const targetDeck = await prisma.flashcardDeck.findFirst({
        where: { id: body.deckId, userId: user.id },
      });
      if (!targetDeck) {
        throw new AppError("Bộ thẻ đích không hợp lệ.", 400, "INVALID_DECK");
      }
    }

    const updated = await prisma.flashcard.update({
      where: { id },
      data: body,
    });
    return apiOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;

    const existing = await prisma.flashcard.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!existing) {
      throw new AppError("Không tìm thấy thẻ Flashcard.", 404, "FLASHCARD_NOT_FOUND");
    }

    await prisma.flashcard.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return apiOk({ deleted: true, id });
  } catch (error) {
    return handleApiError(error);
  }
}
