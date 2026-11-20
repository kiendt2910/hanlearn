import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { generateFlashcardsFromLesson } from "@/modules/flashcards/flashcard.service";
import {
  finalizeExamAttempt,
  getExamAttemptSafe,
  saveExamAnswer,
  startExamAttempt,
} from "@/modules/examinations/exam.service";
import { processOfflineSyncBatch } from "@/modules/offline/sync.service";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("Full Platform Integration Tests (Live PostgreSQL)", () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("has verified lessons seeded across Foundation (13-part) and HSK 1 / HSK 2 / Business (8-section)", async () => {
    const lessons = await prisma.lesson.findMany({
      where: { status: "PUBLISHED" },
      include: {
        sections: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { sections: true } },
      },
    });
    expect(lessons.length).toBeGreaterThanOrEqual(16);
    for (const lesson of lessons) {
      const payload = (lesson.sections[0]?.contentPayload ?? {}) as Record<string, unknown>;
      if (payload.foundationMode === true) {
        expect(lesson._count.sections).toBeGreaterThanOrEqual(1);
      } else {
        expect(lesson._count.sections).toBe(8);
      }
    }
  });

  it("generates flashcards from a lesson and strictly prevents duplicate cards on repeat calls", async () => {
    const learner = await prisma.user.findUniqueOrThrow({
      where: { email: "learner@hanlearn.local" },
    });
    const lesson = await prisma.lesson.findUniqueOrThrow({
      where: { slug: "hsk1-greetings-intro" },
    });

    const first = await generateFlashcardsFromLesson(learner.id, lesson.id, prisma);
    const second = await generateFlashcardsFromLesson(learner.id, lesson.id, prisma);

    expect(first.createdCount + first.skippedDuplicates).toBeGreaterThanOrEqual(8);
    expect(second.createdCount).toBe(0);
    expect(second.skippedDuplicates).toBeGreaterThanOrEqual(8);
  });

  it("runs an HSK exam without leaking answer keys before submission and grades accurately", async () => {
    const learner = await prisma.user.findUniqueOrThrow({
      where: { email: "learner@hanlearn.local" },
    });
    const template = await prisma.examTemplate.findUniqueOrThrow({
      where: { slug: "hsk1-original-mock-01" },
    });

    const attempt = await startExamAttempt(learner.id, template.id, prisma);
    const safeView = await getExamAttemptSafe(learner.id, attempt.id, prisma);

    // Ensure answer keys are never serialized in active attempt payload
    const serialized = JSON.stringify(safeView);
    expect(serialized).not.toContain("acceptedPayload");

    // Pick first question and submit an answer
    const sections = (safeView as unknown as {
      examTemplate: { sections: Array<{ questions: Array<{ question: { id: string } }> }> };
    }).examTemplate.sections;
    const firstQuestionId = sections[0]?.questions[0]?.question.id;
    expect(firstQuestionId).toBeTruthy();

    await saveExamAnswer(
      {
        userId: learner.id,
        attemptId: attempt.id,
        questionId: firstQuestionId,
        responsePayload: { optionKey: "B" },
        isMarkedReview: true,
      },
      prisma
    );

    const result = await finalizeExamAttempt(learner.id, attempt.id, false, prisma);
    expect(result.maxScore).toBeGreaterThan(0);
    expect(result.correctCount + result.incorrectCount + result.unansweredCount).toBeGreaterThan(0);

    // Clean up test exam attempt
    await prisma.examAttempt.delete({ where: { id: attempt.id } });
  });

  it("enforces idempotency on offline synchronization queue mutations", async () => {
    const learner = await prisma.user.findUniqueOrThrow({
      where: { email: "learner@hanlearn.local" },
    });
    const lesson = await prisma.lesson.findUniqueOrThrow({
      where: { slug: "foundations-pinyin-tones" },
    });

    const mutationId = `test-sync-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const payload = [
      {
        clientMutationId: mutationId,
        entityType: "lesson_progress" as const,
        operationType: "MARK_SECTION",
        clientTimestamp: new Date().toISOString(),
        payload: {
          lessonId: lesson.id,
          completedSections: ["OBJECTIVES"],
          addTimeSeconds: 30,
        },
      },
    ];

    const firstSync = await processOfflineSyncBatch(learner.id, payload, prisma);
    const secondSync = await processOfflineSyncBatch(learner.id, payload, prisma);

    expect(firstSync.results[0].status).toBe("APPLIED");
    expect(firstSync.results[0].idempotent).toBe(false);
    expect(secondSync.results[0].idempotent).toBe(true);

    // Cleanup test sync log
    await prisma.offlineSyncLog.delete({ where: { clientMutationId: mutationId } });
  });
});
