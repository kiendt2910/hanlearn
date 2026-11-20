import {
  ExamAttemptStatus,
  ExamType,
  SkillType,
  type PrismaClient,
} from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/validation/api";
import {
  evaluateQuestionResponse,
  type UserAnswerInput,
} from "@/modules/exercises/grading.service";
import { generateFlashcardsFromIncorrectQuestions } from "@/modules/flashcards/flashcard.service";
import { recordSkillPerformance, touchUserStreak } from "@/modules/progress/progress.service";

export async function startExamAttempt(
  userId: string,
  examTemplateId: string,
  db: PrismaClient = defaultPrisma
) {
  const template = await db.examTemplate.findUnique({
    where: { id: examTemplateId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          questions: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!template || template.status !== "PUBLISHED") {
    throw new AppError("Không tìm thấy đề thi khả dụng.", 404, "EXAM_NOT_FOUND");
  }

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + template.durationSeconds * 1000);

  const attempt = await db.examAttempt.create({
    data: {
      userId,
      examTemplateId: template.id,
      status: ExamAttemptStatus.IN_PROGRESS,
      startedAt,
      expiresAt,
      configSnapshot: {
        durationSeconds: template.durationSeconds,
        totalPoints: template.totalPoints,
        passingScore: template.passingScore,
        examType: template.examType,
      },
    },
  });

  return attempt;
}

/**
 * Fetches an active exam attempt strictly WITHOUT exposing QuestionAnswer records.
 */
export async function getExamAttemptSafe(
  userId: string,
  attemptId: string,
  db: PrismaClient = defaultPrisma
) {
  const attempt = await db.examAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      examTemplate: {
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: {
              questions: {
                orderBy: { sortOrder: "asc" },
                include: {
                  question: {
                    select: {
                      id: true,
                      questionType: true,
                      skillType: true,
                      promptVi: true,
                      promptZh: true,
                      promptPinyin: true,
                      passageZh: true,
                      passagePinyin: true,
                      metadata: true,
                      points: true,
                      options: {
                        orderBy: { sortOrder: "asc" },
                        select: {
                          id: true,
                          optionKey: true,
                          labelZh: true,
                          labelPinyin: true,
                          labelVi: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      answers: {
        select: {
          questionId: true,
          responsePayload: true,
          isMarkedReview: true,
        },
      },
      result: true,
    },
  });

  if (!attempt) {
    throw new AppError("Không tìm thấy lượt làm bài thi.", 404, "ATTEMPT_NOT_FOUND");
  }

  // Server-enforced auto-submit if deadline passed while still IN_PROGRESS
  if (
    attempt.status === ExamAttemptStatus.IN_PROGRESS &&
    new Date() > attempt.expiresAt
  ) {
    await finalizeExamAttempt(userId, attemptId, true, db);
    return db.examAttempt.findFirstOrThrow({
      where: { id: attemptId, userId },
      include: { result: true, examTemplate: true },
    });
  }

  return attempt;
}

export async function saveExamAnswer(
  params: {
    userId: string;
    attemptId: string;
    questionId: string;
    responsePayload?: UserAnswerInput;
    isMarkedReview?: boolean;
  },
  db: PrismaClient = defaultPrisma
) {
  const attempt = await db.examAttempt.findFirst({
    where: { id: params.attemptId, userId: params.userId },
  });

  if (!attempt) {
    throw new AppError("Không tìm thấy lượt thi.", 404, "ATTEMPT_NOT_FOUND");
  }

  if (attempt.status !== ExamAttemptStatus.IN_PROGRESS) {
    throw new AppError("Bài thi đã được nộp, không thể chỉnh sửa.", 400, "EXAM_LOCKED");
  }

  if (new Date() > attempt.expiresAt) {
    await finalizeExamAttempt(params.userId, params.attemptId, true, db);
    throw new AppError("Đã hết thời gian làm bài. Hệ thống đã tự động nộp bài.", 409, "EXAM_EXPIRED");
  }

  return db.examAnswer.upsert({
    where: {
      examAttemptId_questionId: {
        examAttemptId: params.attemptId,
        questionId: params.questionId,
      },
    },
    update: {
      ...(params.responsePayload !== undefined
        ? { responsePayload: params.responsePayload as object }
        : {}),
      ...(params.isMarkedReview !== undefined
        ? { isMarkedReview: params.isMarkedReview }
        : {}),
    },
    create: {
      examAttemptId: params.attemptId,
      questionId: params.questionId,
      responsePayload: (params.responsePayload ?? null) as never,
      isMarkedReview: params.isMarkedReview ?? false,
    },
  });
}

export async function finalizeExamAttempt(
  userId: string,
  attemptId: string,
  isAutoSubmit = false,
  db: PrismaClient = defaultPrisma
) {
  const attempt = await db.examAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      result: true,
      answers: true,
      examTemplate: {
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: {
              questions: {
                orderBy: { sortOrder: "asc" },
                include: {
                  question: {
                    include: {
                      answers: true,
                      explanations: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError("Không tìm thấy lượt thi.", 404, "ATTEMPT_NOT_FOUND");
  }

  if (attempt.result) {
    return attempt.result;
  }

  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const skillBreakdown: Record<
    string,
    { score: number; max: number; correct: number; total: number; accuracy: number }
  > = {};

  const wrongQuestions: Array<{
    questionId: string;
    promptZh?: string | null;
    promptPinyin?: string | null;
    promptVi?: string | null;
    explanationVi?: string | null;
  }> = [];

  const gradedAnswerUpdates: Array<{
    questionId: string;
    isCorrect: boolean;
    pointsAwarded: number;
  }> = [];

  for (const section of attempt.examTemplate.sections) {
    for (const sq of section.questions) {
      const q = sq.question;
      const pts = sq.pointsOverride ?? q.points;
      maxScore += pts;

      const saved = answerMap.get(q.id);
      const hasResponse =
        saved?.responsePayload !== null &&
        saved?.responsePayload !== undefined &&
        Object.keys(saved.responsePayload as object).length > 0;

      const isCorrect = hasResponse
        ? evaluateQuestionResponse(
            q.questionType,
            saved.responsePayload as UserAnswerInput,
            q.answers
          )
        : false;

      if (!hasResponse) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      const pointsAwarded = isCorrect ? pts : 0;
      totalScore += pointsAwarded;

      gradedAnswerUpdates.push({
        questionId: q.id,
        isCorrect,
        pointsAwarded,
      });

      const skillBucket = skillBreakdown[q.skillType] ?? {
        score: 0,
        max: 0,
        correct: 0,
        total: 0,
        accuracy: 0,
      };
      skillBucket.score += pointsAwarded;
      skillBucket.max += pts;
      skillBucket.total += 1;
      if (isCorrect) skillBucket.correct += 1;
      skillBucket.accuracy =
        skillBucket.total > 0
          ? Math.round((skillBucket.correct / skillBucket.total) * 100)
          : 0;
      skillBreakdown[q.skillType] = skillBucket;

      if (!isCorrect) {
        wrongQuestions.push({
          questionId: q.id,
          promptZh: q.promptZh,
          promptPinyin: q.promptPinyin,
          promptVi: q.promptVi,
          explanationVi: q.explanations[0]?.explanationVi ?? null,
        });
      }
    }
  }

  const totalQuestions = correctCount + incorrectCount + unansweredCount;
  const accuracyPercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = totalScore >= attempt.examTemplate.passingScore;

  const weakSkills = Object.entries(skillBreakdown)
    .filter(([, stat]) => stat.accuracy < 75)
    .map(([skill]) => skill);

  const recommendedRevisionVi: string[] = [];
  if (weakSkills.length === 0) {
    recommendedRevisionVi.push(
      "Kết quả rất tốt! Bạn có thể tiếp tục bài học tiếp theo hoặc thử sức với đề thi cấp độ cao hơn."
    );
  } else {
    for (const s of weakSkills) {
      recommendedRevisionVi.push(
        `Nên ôn tập lại kỹ năng ${s} (độ chính xác dưới 75%) và làm lại các thẻ Flashcard tự động tạo từ câu sai.`
      );
    }
  }

  // Placement level recommendation if PLACEMENT exam
  let recommendedLevelId: string | null = null;
  if (attempt.examTemplate.examType === ExamType.PLACEMENT) {
    const targetCode =
      accuracyPercent >= 85 ? "hsk-2" : accuracyPercent >= 50 ? "hsk-1" : "foundations";
    const lvl = await db.learningLevel.findFirst({
      where: { code: targetCode, status: "PUBLISHED" },
      select: { id: true },
    });
    recommendedLevelId = lvl?.id ?? null;
  }

  const now = new Date();
  const timeSpentSeconds = Math.min(
    attempt.examTemplate.durationSeconds,
    Math.max(1, Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000))
  );

  const result = await db.$transaction(async (tx) => {
    for (const upd of gradedAnswerUpdates) {
      await tx.examAnswer.upsert({
        where: {
          examAttemptId_questionId: {
            examAttemptId: attempt.id,
            questionId: upd.questionId,
          },
        },
        update: {
          isCorrect: upd.isCorrect,
          pointsAwarded: upd.pointsAwarded,
        },
        create: {
          examAttemptId: attempt.id,
          questionId: upd.questionId,
          isCorrect: upd.isCorrect,
          pointsAwarded: upd.pointsAwarded,
        },
      });
    }

    await tx.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: isAutoSubmit
          ? ExamAttemptStatus.AUTO_SUBMITTED
          : ExamAttemptStatus.SUBMITTED,
        submittedAt: now,
        timeSpentSeconds,
      },
    });

    const createdResult = await tx.examResult.create({
      data: {
        examAttemptId: attempt.id,
        totalScore,
        maxScore,
        accuracyPercent,
        passed,
        correctCount,
        incorrectCount,
        unansweredCount,
        skillBreakdown,
        recommendedRevisionVi,
        recommendedLevelId,
      },
    });

    if (recommendedLevelId) {
      await tx.userProfile.updateMany({
        where: { userId },
        data: {
          currentLevelId: recommendedLevelId,
          placementCompletedAt: now,
        },
      });
    }

    await tx.studySession.create({
      data: {
        userId,
        moduleType: "exam",
        durationSeconds: timeSpentSeconds,
        itemsCompleted: totalQuestions,
        startedAt: attempt.startedAt,
        endedAt: now,
      },
    });

    return createdResult;
  });

  // Update skill statistics & auto-generate error flashcards
  for (const [skill, stat] of Object.entries(skillBreakdown)) {
    await recordSkillPerformance(
      userId,
      skill as SkillType,
      stat.correct,
      stat.total,
      Math.round(timeSpentSeconds / Math.max(1, Object.keys(skillBreakdown).length)),
      db
    );
  }
  await generateFlashcardsFromIncorrectQuestions(userId, wrongQuestions, db);
  await touchUserStreak(userId, db);

  return result;
}
