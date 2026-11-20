import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { finalizeExamAttempt } from "@/modules/examinations/exam.service";

const submitExamSchema = z.object({
  isAutoSubmit: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { attemptId } = await context.params;
    const raw = await request.json().catch(() => ({}));
    const body = submitExamSchema.parse(raw);

    const result = await finalizeExamAttempt(
      user.id,
      attemptId,
      Boolean(body.isAutoSubmit)
    );
    return apiOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
