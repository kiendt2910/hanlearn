import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";

export interface AdaptiveRemediationItem {
  conceptId: string;
  conceptCode: string;
  titleVi: string;
  explanationVi: string;
  simpleExplanationVi: string;
  extraExamples: Array<{ zh: string; pinyin?: string; vi: string }>;
  remediationQuestion?: {
    promptVi: string;
    options: string[];
    correctIndex: number;
    explanationVi: string;
  } | null;
  prerequisiteLesson?: { slug: string; titleVi: string } | null;
  consecutiveMisses: number;
}

export async function recordConceptAttempt(
  userId: string,
  conceptId: string,
  isCorrect: boolean,
  db: PrismaClient = defaultPrisma
): Promise<AdaptiveRemediationItem | null> {
  const existing = await db.userConceptMastery.findUnique({
    where: { userId_conceptId: { userId, conceptId } },
  });

  const attemptsCount = (existing?.attemptsCount ?? 0) + 1;
  const correctCount = (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0);
  const consecutiveMisses = isCorrect ? 0 : (existing?.consecutiveMisses ?? 0) + 1;
  const masteryScore = Math.round((correctCount / attemptsCount) * 100);
  const needsRemediation = consecutiveMisses >= 2 || (attemptsCount >= 3 && masteryScore < 60);

  await db.userConceptMastery.upsert({
    where: { userId_conceptId: { userId, conceptId } },
    update: {
      attemptsCount,
      correctCount,
      consecutiveMisses,
      masteryScore,
      needsRemediation,
      lastReviewedAt: new Date(),
    },
    create: {
      userId,
      conceptId,
      attemptsCount,
      correctCount,
      consecutiveMisses,
      masteryScore,
      needsRemediation,
      lastReviewedAt: new Date(),
    },
  });

  if (!needsRemediation || isCorrect) {
    return null;
  }

  const concept = await db.learningConcept.findUnique({
    where: { id: conceptId },
    include: {
      prerequisiteLesson: { select: { slug: true, titleVi: true } },
    },
  });

  if (!concept) return null;

  return {
    conceptId: concept.id,
    conceptCode: concept.code,
    titleVi: concept.titleVi,
    explanationVi: concept.explanationVi,
    simpleExplanationVi: concept.simpleExplanationVi,
    extraExamples: Array.isArray(concept.extraExamples)
      ? (concept.extraExamples as Array<{ zh: string; pinyin?: string; vi: string }>)
      : [],
    remediationQuestion:
      (concept.remediationQuestion as AdaptiveRemediationItem["remediationQuestion"]) ?? null,
    prerequisiteLesson: concept.prerequisiteLesson,
    consecutiveMisses,
  };
}

export const FOUNDATION_PILLARS = [
  { code: "PINYIN", labelVi: "Pinyin (Thanh mẫu & Vận mẫu)" },
  { code: "TONES", labelVi: "4 Thanh điệu, Thanh nhẹ & Nghe" },
  { code: "STROKES", labelVi: "8 Nét cơ bản & Quy tắc Bút thuận" },
  { code: "RADICALS", labelVi: "Bộ thủ & Thành phần chữ Hán" },
  { code: "VOCAB_GRAMMAR", labelVi: "Từ vựng đầu tiên & Ngữ pháp nền" },
  { code: "SENTENCES", labelVi: "Ghép câu & Giao tiếp sơ khởi" },
] as const;

export async function computeFoundationReadiness(
  userId: string,
  db: PrismaClient = defaultPrisma
) {
  const [concepts, masteries, foundationLessons, lessonProgress, finalExamAttempt] =
    await Promise.all([
      db.learningConcept.findMany({ where: { status: "PUBLISHED" } }),
      db.userConceptMastery.findMany({ where: { userId } }),
      db.lesson.findMany({
        where: {
          status: "PUBLISHED",
          module: { course: { learningLevel: { code: "foundations" } } },
        },
        select: { id: true },
      }),
      db.userLessonProgress.findMany({
        where: {
          userId,
          lesson: { module: { course: { learningLevel: { code: "foundations" } } } },
        },
      }),
      db.examAttempt.findFirst({
        where: {
          userId,
          examTemplate: { slug: "foundation-final-assessment" },
          result: { isNot: null },
        },
        orderBy: { submittedAt: "desc" },
        include: { result: true },
      }),
    ]);

  const masteryMap = new Map(masteries.map((m) => [m.conceptId, m]));

  const pillarBreakdown = FOUNDATION_PILLARS.map((p) => {
    const pillarConcepts = concepts.filter((c) => c.pillar === p.code);
    const total = pillarConcepts.length;
    const avgScore =
      total > 0
        ? Math.round(
            pillarConcepts.reduce(
              (acc, c) => acc + (masteryMap.get(c.id)?.masteryScore ?? 0),
              0
            ) / total
          )
        : 0;
    const weakCount = pillarConcepts.filter(
      (c) => masteryMap.get(c.id)?.needsRemediation
    ).length;

    return {
      pillar: p.code,
      labelVi: p.labelVi,
      conceptCount: total,
      masteryPercent: avgScore,
      passedThreshold: avgScore >= 70,
      weakCount,
    };
  });

  const overallMasteryPercent = Math.round(
    pillarBreakdown.reduce((acc, p) => acc + p.masteryPercent, 0) /
      Math.max(1, pillarBreakdown.length)
  );

  const completedFoundationLessons = lessonProgress.filter(
    (p) => p.status === "COMPLETED"
  ).length;
  const totalFoundationLessons = foundationLessons.length;
  const passedFinalAssessment = Boolean(finalExamAttempt?.result?.passed);

  // Strict multi-skill readiness rule (Section 7 & 8): NEVER based on vocabulary alone!
  const allPillarsReady = pillarBreakdown.every((p) => p.passedThreshold);
  const readyForHsk1 =
    passedFinalAssessment && overallMasteryPercent >= 80 && allPillarsReady;

  return {
    readyForHsk1,
    overallMasteryPercent,
    completedFoundationLessons,
    totalFoundationLessons,
    passedFinalAssessment,
    latestAssessmentScore: finalExamAttempt?.result
      ? {
          attemptId: finalExamAttempt.id,
          totalScore: finalExamAttempt.result.totalScore,
          maxScore: finalExamAttempt.result.maxScore,
          accuracyPercent: finalExamAttempt.result.accuracyPercent,
          passed: finalExamAttempt.result.passed,
        }
      : null,
    pillarBreakdown,
  };
}
