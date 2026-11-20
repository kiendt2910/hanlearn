import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id: vocabularyId } = await context.params;

    const existing = await prisma.userVocabularyProgress.findUnique({
      where: { userId_vocabularyId: { userId: user.id, vocabularyId } },
    });

    const updated = await prisma.userVocabularyProgress.upsert({
      where: { userId_vocabularyId: { userId: user.id, vocabularyId } },
      update: {
        isBookmarked: !(existing?.isBookmarked ?? false),
        lastSeenAt: new Date(),
      },
      create: {
        userId: user.id,
        vocabularyId,
        isBookmarked: true,
        lastSeenAt: new Date(),
      },
    });

    return apiOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
