import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { submitExerciseAttempt } from "@/modules/exercises/grading.service";

const submitSchema = z.object({
  responses: z.record(
    z.string(),
    z.object({
      optionKey: z.string().optional(),
      text: z.string().optional(),
      orderedTokens: z.array(z.string()).optional(),
    })
  ),
  timeSpentSeconds: z.number().int().min(0).max(7200).optional(),
  clientMutationId: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id: exerciseId } = await context.params;
    const body = submitSchema.parse(await request.json());

    const result = await submitExerciseAttempt({
      userId: user.id,
      exerciseId,
      responses: body.responses,
      timeSpentSeconds: body.timeSpentSeconds,
      clientMutationId: body.clientMutationId,
    });

    return apiOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
