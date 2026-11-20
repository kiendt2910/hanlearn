import { NextRequest } from "next/server";
import { LessonProgressStatus, LessonSectionType } from "@prisma/client";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";
import { updateLessonProgress } from "@/modules/progress/progress.service";

const progressSchema = z.object({
  status: z.nativeEnum(LessonProgressStatus).optional(),
  completedSections: z.array(z.nativeEnum(LessonSectionType)).optional(),
  addTimeSeconds: z.number().int().min(0).max(7200).optional(),
  skippedViaTest: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const body = progressSchema.parse(await request.json());

    const updated = await updateLessonProgress({
      userId: user.id,
      lessonId: id,
      status: body.status,
      completedSections: body.completedSections,
      addTimeSeconds: body.addTimeSeconds,
      skippedViaTest: body.skippedViaTest,
    });

    if (!updated) {
      throw new AppError("Không tìm thấy bài học.", 404, "LESSON_NOT_FOUND");
    }

    return apiOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
