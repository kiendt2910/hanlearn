import { NextRequest } from "next/server";
import { ReviewRating } from "@prisma/client";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { recordFlashcardReview } from "@/modules/flashcards/flashcard.service";
import { touchUserStreak } from "@/modules/progress/progress.service";

const reviewSchema = z.object({
  flashcardId: z.string().uuid(),
  rating: z.nativeEnum(ReviewRating),
  durationMs: z.number().int().min(0).max(600000).optional(),
  clientMutationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = reviewSchema.parse(await request.json());

    const result = await recordFlashcardReview({
      userId: user.id,
      flashcardId: body.flashcardId,
      rating: body.rating,
      durationMs: body.durationMs,
      clientMutationId: body.clientMutationId,
    });
    await touchUserStreak(user.id);

    return apiOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
