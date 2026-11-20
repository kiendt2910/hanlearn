import { NextRequest } from "next/server";
import { FsrsCardState } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";

const createCardSchema = z.object({
  deckId: z.string().uuid(),
  frontZh: z.string().trim().min(1, "Nhập mặt trước tiếng Trung."),
  frontPinyin: z.string().trim().optional(),
  backVi: z.string().trim().min(1, "Nhập nghĩa tiếng Việt."),
  exampleZh: z.string().trim().optional(),
  exampleVi: z.string().trim().optional(),
  notesVi: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = createCardSchema.parse(await request.json());

    const deck = await prisma.flashcardDeck.findFirst({
      where: { id: body.deckId, userId: user.id },
      select: { id: true },
    });
    if (!deck) {
      throw new AppError("Không tìm thấy bộ thẻ.", 404, "DECK_NOT_FOUND");
    }

    const card = await prisma.flashcard.create({
      data: {
        userId: user.id,
        deckId: body.deckId,
        frontZh: body.frontZh,
        frontPinyin: body.frontPinyin || null,
        backVi: body.backVi,
        exampleZh: body.exampleZh || null,
        exampleVi: body.exampleVi || null,
        notesVi: body.notesVi || null,
        state: {
          create: {
            state: FsrsCardState.NEW,
            dueAt: new Date(),
          },
        },
      },
      include: { state: true },
    });

    return apiOk(card, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
