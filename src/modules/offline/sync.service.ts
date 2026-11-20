import {
  LessonProgressStatus,
  LessonSectionType,
  ReviewRating,
  SyncOperationStatus,
  type PrismaClient,
} from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";
import { recordFlashcardReview } from "@/modules/flashcards/flashcard.service";
import { updateLessonProgress } from "@/modules/progress/progress.service";
import {
  submitExerciseAttempt,
  type UserAnswerInput,
} from "@/modules/exercises/grading.service";

export interface OfflineMutationItem {
  clientMutationId: string;
  entityType: "flashcard_review" | "lesson_progress" | "exercise_attempt" | "study_session";
  operationType: string;
  clientTimestamp: string;
  payload: Record<string, unknown>;
}

export async function processOfflineSyncBatch(
  userId: string,
  mutations: OfflineMutationItem[],
  db: PrismaClient = defaultPrisma
) {
  const results: Array<{
    clientMutationId: string;
    status: SyncOperationStatus;
    idempotent: boolean;
    message?: string;
  }> = [];

  const sorted = [...mutations].sort(
    (a, b) => new Date(a.clientTimestamp).getTime() - new Date(b.clientTimestamp).getTime()
  );

  for (const item of sorted) {
    const existingLog = await db.offlineSyncLog.findUnique({
      where: { clientMutationId: item.clientMutationId },
    });

    if (existingLog) {
      results.push({
        clientMutationId: item.clientMutationId,
        status: existingLog.status,
        idempotent: true,
        message: "Đã đồng bộ trước đó (bỏ qua trùng lặp).",
      });
      continue;
    }

    try {
      let opStatus: SyncOperationStatus = SyncOperationStatus.APPLIED;

      if (item.entityType === "flashcard_review") {
        await recordFlashcardReview(
          {
            userId,
            flashcardId: String(item.payload.flashcardId),
            rating: String(item.payload.rating) as ReviewRating,
            durationMs:
              typeof item.payload.durationMs === "number"
                ? item.payload.durationMs
                : undefined,
            clientMutationId: item.clientMutationId,
            reviewedAt: new Date(item.clientTimestamp),
          },
          db
        );
      } else if (item.entityType === "lesson_progress") {
        const updated = await updateLessonProgress(
          {
            userId,
            lessonId: String(item.payload.lessonId),
            status: item.payload.status
              ? (String(item.payload.status) as LessonProgressStatus)
              : undefined,
            completedSections: Array.isArray(item.payload.completedSections)
              ? (item.payload.completedSections as LessonSectionType[])
              : [],
            addTimeSeconds:
              typeof item.payload.addTimeSeconds === "number"
                ? item.payload.addTimeSeconds
                : 0,
          },
          db
        );
        if (!updated) {
          opStatus = SyncOperationStatus.REJECTED;
        }
      } else if (item.entityType === "exercise_attempt") {
        await submitExerciseAttempt(
          {
            userId,
            exerciseId: String(item.payload.exerciseId),
            responses: (item.payload.responses ?? {}) as Record<string, UserAnswerInput>,
            timeSpentSeconds:
              typeof item.payload.timeSpentSeconds === "number"
                ? item.payload.timeSpentSeconds
                : 0,
            clientMutationId: item.clientMutationId,
          },
          db
        );
      } else if (item.entityType === "study_session") {
        await db.studySession.create({
          data: {
            userId,
            moduleType: String(item.payload.moduleType || "offline"),
            durationSeconds: Number(item.payload.durationSeconds || 60),
            itemsCompleted: Number(item.payload.itemsCompleted || 1),
            startedAt: new Date(String(item.payload.startedAt || item.clientTimestamp)),
            endedAt: new Date(item.clientTimestamp),
            clientMutationId: item.clientMutationId,
          },
        });
      }

      await db.offlineSyncLog.create({
        data: {
          userId,
          clientMutationId: item.clientMutationId,
          entityType: item.entityType,
          operationType: item.operationType,
          status: opStatus,
          clientTimestamp: new Date(item.clientTimestamp),
        },
      });

      results.push({
        clientMutationId: item.clientMutationId,
        status: opStatus,
        idempotent: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      await db.offlineSyncLog.create({
        data: {
          userId,
          clientMutationId: item.clientMutationId,
          entityType: item.entityType,
          operationType: item.operationType,
          status: SyncOperationStatus.FAILED,
          conflictDetail: { error: message },
          clientTimestamp: new Date(item.clientTimestamp),
        },
      });
      results.push({
        clientMutationId: item.clientMutationId,
        status: SyncOperationStatus.FAILED,
        idempotent: false,
        message,
      });
    }
  }

  return {
    syncedAt: new Date().toISOString(),
    results,
  };
}
