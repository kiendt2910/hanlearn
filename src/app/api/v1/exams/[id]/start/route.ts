import { NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { startExamAttempt } from "@/modules/examinations/exam.service";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const attempt = await startExamAttempt(user.id, id);
    return apiOk(attempt, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
