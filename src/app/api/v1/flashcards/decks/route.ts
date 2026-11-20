import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";

const createDeckSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên bộ thẻ.").max(80),
  description: z.string().trim().max(240).optional(),
});

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const decks = await prisma.flashcardDeck.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { flashcards: { where: { deletedAt: null } } } },
      },
    });
    return apiOk(decks);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = createDeckSchema.parse(await request.json());

    const deck = await prisma.flashcardDeck.create({
      data: {
        userId: user.id,
        name: body.name,
        description: body.description ?? null,
      },
    });
    return apiOk(deck, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
