import {
  LessonProgressStatus,
  LessonSectionType,
  SkillType,
  type PrismaClient,
} from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";

const STATUS_RANK: Record<LessonProgressStatus, number> = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  NEEDS_REVIEW: 2,
  COMPLETED: 3,
};

export function mergeLessonProgressMonotonically(
  existingStatus: LessonProgressStatus,
  incomingStatus: LessonProgressStatus,
  existingSections: string[],
  incomingSections: string[]
) {
  const mergedSections = Array.from(new Set([...existingSections, ...incomingSections]));
  const nextStatus =
    STATUS_RANK[incomingStatus] >= STATUS_RANK[existingStatus]
      ? incomingStatus
      : existingStatus;

  return { status: nextStatus, completedSections: mergedSections };
}

export async function updateLessonProgress(
  params: {
    userId: string;
    lessonId: string;
    status?: LessonProgressStatus;
    completedSections?: LessonSectionType[];
    lastScorePercent?: number;
    addTimeSeconds?: number;
    skippedViaTest?: boolean;
  },
  db: PrismaClient = defaultPrisma
) {
  const lesson = await db.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: { select: { courseId: true } },
      sections: { select: { sectionType: true } },
    },
  });
  if (!lesson) return null;

  const existing = await db.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId: params.userId, lessonId: params.lessonId } },
  });

  const existingSections = Array.isArray(existing?.completedSections)
    ? (existing.completedSections as string[])
    : [];
  const incomingSections = params.completedSections ?? [];

  const mergedSections = Array.from(new Set([...existingSections, ...incomingSections]));
  const totalSectionCount = Math.max(1, lesson.sections.length);

  let derivedStatus: LessonProgressStatus = params.status ?? existing?.status ?? "IN_PROGRESS";
  if (mergedSections.length >= totalSectionCount && derivedStatus !== "NEEDS_REVIEW") {
    derivedStatus = "COMPLETED";
  } else if (mergedSections.length > 0 && derivedStatus === "NOT_STARTED") {
    derivedStatus = "IN_PROGRESS";
  }

  const finalStatus =
    existing && !params.status
      ? mergeLessonProgressMonotonically(
          existing.status,
          derivedStatus,
          existingSections,
          incomingSections
        ).status
      : derivedStatus;

  const updated = await db.userLessonProgress.upsert({
    where: { userId_lessonId: { userId: params.userId, lessonId: params.lessonId } },
    update: {
      status: finalStatus,
      completedSections: mergedSections,
      lastScorePercent: params.lastScorePercent ?? existing?.lastScorePercent,
      timeSpentSeconds: (existing?.timeSpentSeconds ?? 0) + (params.addTimeSeconds ?? 0),
      skippedViaTest: params.skippedViaTest ?? existing?.skippedViaTest ?? false,
      lastAccessedAt: new Date(),
      completedAt:
        finalStatus === "COMPLETED" ? existing?.completedAt ?? new Date() : existing?.completedAt,
    },
    create: {
      userId: params.userId,
      lessonId: params.lessonId,
      status: finalStatus,
      completedSections: mergedSections,
      lastScorePercent: params.lastScorePercent ?? null,
      timeSpentSeconds: params.addTimeSeconds ?? 0,
      skippedViaTest: params.skippedViaTest ?? false,
      completedAt: finalStatus === "COMPLETED" ? new Date() : null,
    },
  });

  // Recalculate parent course progress
  const courseId = lesson.module.courseId;
  const totalCourseLessons = await db.lesson.count({
    where: { module: { courseId }, status: "PUBLISHED" },
  });
  const completedCourseLessons = await db.userLessonProgress.count({
    where: {
      userId: params.userId,
      status: "COMPLETED",
      lesson: { module: { courseId }, status: "PUBLISHED" },
    },
  });

  const progressPercent =
    totalCourseLessons > 0
      ? Math.round((completedCourseLessons / totalCourseLessons) * 100)
      : 0;

  await db.userCourseProgress.upsert({
    where: { userId_courseId: { userId: params.userId, courseId } },
    update: {
      completedLessons: completedCourseLessons,
      totalLessons: totalCourseLessons,
      progressPercent,
      completedAt: progressPercent >= 100 ? new Date() : null,
    },
    create: {
      userId: params.userId,
      courseId,
      completedLessons: completedCourseLessons,
      totalLessons: totalCourseLessons,
      progressPercent,
      completedAt: progressPercent >= 100 ? new Date() : null,
    },
  });

  await touchUserStreak(params.userId, db);

  return updated;
}

export async function recordSkillPerformance(
  userId: string,
  skillType: SkillType,
  correctDelta: number,
  attemptsDelta: number,
  timeDeltaSec = 0,
  db: PrismaClient = defaultPrisma
) {
  const existing = await db.userSkillStat.findUnique({
    where: { userId_skillType: { userId, skillType } },
  });

  const nextAttempts = (existing?.attemptsCount ?? 0) + attemptsDelta;
  const nextCorrect = (existing?.correctCount ?? 0) + correctDelta;
  const masteryScore =
    nextAttempts > 0 ? Math.round((nextCorrect / nextAttempts) * 100) : 0;

  await db.userSkillStat.upsert({
    where: { userId_skillType: { userId, skillType } },
    update: {
      attemptsCount: nextAttempts,
      correctCount: nextCorrect,
      masteryScore,
      totalTimeSec: (existing?.totalTimeSec ?? 0) + timeDeltaSec,
    },
    create: {
      userId,
      skillType,
      attemptsCount: nextAttempts,
      correctCount: nextCorrect,
      masteryScore,
      totalTimeSec: timeDeltaSec,
    },
  });
}

export async function touchUserStreak(userId: string, db: PrismaClient = defaultPrisma) {
  const profile = await db.userProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const lastStr = profile.lastStudyDate
    ? profile.lastStudyDate.toISOString().slice(0, 10)
    : null;

  if (lastStr === todayStr) return;

  const yesterday = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  const nextStreak = lastStr === yesterday ? profile.streakDays + 1 : 1;
  const longestStreak = Math.max(profile.longestStreakDays, nextStreak);

  await db.userProfile.update({
    where: { userId },
    data: {
      streakDays: nextStreak,
      longestStreakDays: longestStreak,
      lastStudyDate: new Date(todayStr),
    },
  });
}
