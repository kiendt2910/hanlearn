import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
) {
  try {
    await requireAuthenticatedUser();
    const { lessonId } = await context.params;

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, status: "PUBLISHED" },
      include: {
        sections: { orderBy: { sortOrder: "asc" } },
        lessonVocabulary: {
          orderBy: { sortOrder: "asc" },
          include: {
            vocabulary: {
              include: { examples: true, senses: true },
            },
          },
        },
        lessonGrammar: {
          orderBy: { sortOrder: "asc" },
          include: {
            grammarPoint: {
              include: { examples: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError("Không tìm thấy bài học để tải ngoại tuyến.", 404, "LESSON_NOT_FOUND");
    }

    return apiOk({
      lessonId: lesson.id,
      slug: lesson.slug,
      titleVi: lesson.titleVi,
      titleZh: lesson.titleZh,
      contentVersion: lesson.contentVersion,
      downloadedAt: new Date().toISOString(),
      bundleData: lesson,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
