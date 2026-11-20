import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { handleApiError } from "@/lib/validation/api";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const decks = await prisma.flashcardDeck.findMany({
      where: { userId: user.id },
      include: {
        flashcards: {
          where: { deletedAt: null },
          select: {
            frontZh: true,
            frontPinyin: true,
            backVi: true,
            exampleZh: true,
            exampleVi: true,
            notesVi: true,
            tags: true,
          },
        },
      },
    });

    return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), decks }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="hanlearn-flashcards.json"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
