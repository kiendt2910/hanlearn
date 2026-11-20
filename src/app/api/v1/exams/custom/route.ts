import { NextRequest } from "next/server";
import { ContentOrigin, ContentStatus, ExamType, SkillType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";
import { startExamAttempt } from "@/modules/examinations/exam.service";

const customExamSchema = z.object({
  titleVi: z.string().trim().min(2).max(120).optional(),
  skills: z.array(z.nativeEnum(SkillType)).min(1),
  durationMinutes: z.number().int().min(3).max(120),
  questionLimit: z.number().int().min(2).max(40),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = customExamSchema.parse(await request.json());

    const questions = await prisma.question.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        skillType: { in: body.skills },
      },
      take: body.questionLimit,
      orderBy: { createdAt: "desc" },
    });

    if (questions.length === 0) {
      throw new AppError(
        "Chưa có câu hỏi phù hợp cho bộ kỹ năng bạn chọn.",
        404,
        "NO_MATCHING_QUESTIONS"
      );
    }

    const totalPoints = questions.length * 10;
    const template = await prisma.examTemplate.create({
      data: {
        slug: `custom-${user.id.slice(0, 8)}-${Date.now()}`,
        titleVi: body.titleVi || `Đề luyện tập tùy chỉnh (${questions.length} câu)`,
        descriptionVi: "Đề luyện tập tùy chọn tạo từ ngân hàng câu hỏi HanLearn.",
        examType: ExamType.CUSTOM,
        durationSeconds: body.durationMinutes * 60,
        totalPoints,
        passingScore: Math.round(totalPoints * 0.6),
        scoringRules: { configurable: true, custom: true, pointsPerQuestion: 10 },
        isOfficialLicensed: false,
        status: ContentStatus.PUBLISHED,
        origin: ContentOrigin.VERIFIED_ORIGINAL,
        sections: {
          create: {
            titleVi: "Phần luyện tập tùy chỉnh",
            skillType: body.skills[0],
            sectionPoints: totalPoints,
            sortOrder: 1,
            questions: {
              create: questions.map((q, idx) => ({
                questionId: q.id,
                sortOrder: idx + 1,
                pointsOverride: 10,
              })),
            },
          },
        },
      },
    });

    const attempt = await startExamAttempt(user.id, template.id);
    return apiOk({ templateId: template.id, attemptId: attempt.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
