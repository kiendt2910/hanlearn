import { NextRequest } from "next/server";
import { FsrsCardState } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";

const importSchema = z.object({
  deckName: z.string().trim().min(1).max(80),
  cards: z
    .array(
      z.object({
        frontZh: z.string().trim().min(1),
        frontPinyin: z.string().trim().optional(),
        backVi: z.string().trim().min(1),
        exampleZh: z.string().trim().optional(),
        exampleVi: z.string().trim().optional(),
      })
    )
    .min(1)
    .max(500),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = importSchema.parse(await request.json());

    const deck = await prisma.flashcardDeck.upsert({
      where: { userId_name: { userId: user.id, name: body.deckName } },
      update: {},
      create: {
        userId: user.id,
        name: body.deckName,
        description: "Bộ thẻ nhập từ tệp JSON.",
      },
    });

    let imported = 0;
    for (const item of body.cards) {
      await prisma.flashcard.create({
        data: {
          userId: user.id,
          deckId: deck.id,
          frontZh: item.frontZh,
          frontPinyin: item.frontPinyin ?? null,
          backVi: item.backVi,
          exampleZh: item.exampleZh ?? null,
          exampleVi: item.exampleVi ?? null,
          state: {
            create: { state: FsrsCardState.NEW, dueAt: new Date() },
          },
        },
      });
      imported++;
    }

    return apiOk({ deckId: deck.id, imported }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
