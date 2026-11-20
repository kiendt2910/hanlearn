import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { processOfflineSyncBatch } from "@/modules/offline/sync.service";

const syncSchema = z.object({
  mutations: z
    .array(
      z.object({
        clientMutationId: z.string().min(8).max(120),
        entityType: z.enum([
          "flashcard_review",
          "lesson_progress",
          "exercise_attempt",
          "study_session",
        ]),
        operationType: z.string().min(1).max(60),
        clientTimestamp: z.string().datetime(),
        payload: z.record(z.string(), z.unknown()),
      })
    )
    .max(200),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = syncSchema.parse(await request.json());

    const result = await processOfflineSyncBatch(user.id, body.mutations);
    return apiOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
