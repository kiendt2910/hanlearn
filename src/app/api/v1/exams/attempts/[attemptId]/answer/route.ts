import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { saveExamAnswer } from "@/modules/examinations/exam.service";

const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  responsePayload: z
    .object({
      optionKey: z.string().optional(),
      text: z.string().optional(),
      orderedTokens: z.array(z.string()).optional(),
    })
    .optional(),
  isMarkedReview: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { attemptId } = await context.params;
    const body = saveAnswerSchema.parse(await request.json());

    const saved = await saveExamAnswer({
      userId: user.id,
      attemptId,
      questionId: body.questionId,
      responsePayload: body.responsePayload,
      isMarkedReview: body.isMarkedReview,
    });

    return apiOk(saved);
  } catch (error) {
    return handleApiError(error);
  }
}
