import { QuestionType, type PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/validation/api";
import { generateFlashcardsFromIncorrectQuestions } from "@/modules/flashcards/flashcard.service";
import { recordSkillPerformance, updateLessonProgress } from "@/modules/progress/progress.service";
import {
  recordConceptAttempt,
  type AdaptiveRemediationItem,
} from "@/modules/foundation/adaptive.service";

export interface QuestionAnswerKey {
  optionKey?: string;
  acceptedTexts?: string[];
  orderedTokens?: string[];
}

export interface UserAnswerInput {
  optionKey?: string;
  text?: string;
  orderedTokens?: string[];
}

function normalizeAnswerText(value: string, caseSensitive = false): string {
  const cleaned = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[。！？.,!?]+$/g, "");
  return caseSensitive ? cleaned : cleaned.toLowerCase();
}

/**
 * Pure deterministic server-side question evaluator.
 * Never runs in the browser; answer keys never leave the server pre-submission.
 */
export function evaluateQuestionResponse(
  questionType: QuestionType,
  userResponse: UserAnswerInput | undefined | null,
  acceptedPayloads: Array<{ acceptedPayload: unknown; caseSensitive: boolean }>
): boolean {
  if (!userResponse || acceptedPayloads.length === 0) return false;

  for (const record of acceptedPayloads) {
    const key = record.acceptedPayload as QuestionAnswerKey;

    if (
      questionType === QuestionType.MULTIPLE_CHOICE ||
      questionType === QuestionType.TRUE_FALSE ||
      questionType === QuestionType.LISTENING_COMPREHENSION ||
      questionType === QuestionType.AUDIO_DISCRIMINATION ||
      questionType === QuestionType.RADICAL_MATCHING
    ) {
      if (
        key.optionKey &&
        userResponse.optionKey &&
        userResponse.optionKey.trim().toUpperCase() === key.optionKey.trim().toUpperCase()
      ) {
        return true;
      }
    }

    if (
      questionType === QuestionType.FILL_IN_BLANK ||
      questionType === QuestionType.TRANSLATION ||
      questionType === QuestionType.WRITING_SHORT ||
      questionType === QuestionType.SYLLABLE_BUILDER
    ) {
      const submitted = normalizeAnswerText(userResponse.text ?? "", record.caseSensitive);
      if (submitted && Array.isArray(key.acceptedTexts)) {
        const matched = key.acceptedTexts.some(
          (acc) => normalizeAnswerText(acc, record.caseSensitive) === submitted
        );
        if (matched) return true;
      }
    }

    if (
      questionType === QuestionType.SENTENCE_ORDERING ||
      questionType === QuestionType.STROKE_ORDER_SEQUENCE
    ) {
      if (
        Array.isArray(key.orderedTokens) &&
        Array.isArray(userResponse.orderedTokens) &&
        key.orderedTokens.length === userResponse.orderedTokens.length
      ) {
        const exact = key.orderedTokens.every(
          (tok, idx) => tok.trim() === userResponse.orderedTokens?.[idx]?.trim()
        );
        if (exact) return true;
      }
    }
  }

  return false;
}

export async function submitExerciseAttempt(
  params: {
    userId: string;
    exerciseId: string;
    responses: Record<string, UserAnswerInput>;
    timeSpentSeconds?: number;
    clientMutationId?: string;
  },
  db: PrismaClient = defaultPrisma
) {
  if (params.clientMutationId) {
    const existing = await db.userExerciseAttempt.findUnique({
      where: { clientMutationId: params.clientMutationId },
    });
    if (existing) {
      return { attempt: existing, idempotent: true, details: [] };
    }
  }

  const exercise = await db.exercise.findUnique({
    where: { id: params.exerciseId },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          answers: true,
          explanations: true,
        },
      },
    },
  });

  if (!exercise) {
    throw new AppError("Không tìm thấy bài tập.", 404, "EXERCISE_NOT_FOUND");
  }

  let score = 0;
  let maxScore = 0;
  const details: Array<{
    questionId: string;
    isCorrect: boolean;
    pointsAwarded: number;
    maxPoints: number;
    explanationVi: string | null;
    correctAnswer: unknown;
  }> = [];

  const wrongQuestionsForFlashcards: Array<{
    questionId: string;
    promptZh?: string | null;
    promptPinyin?: string | null;
    promptVi?: string | null;
    explanationVi?: string | null;
  }> = [];

  const skillDeltas = new Map<string, { correct: number; total: number }>();
  const remediationByConcept = new Map<string, AdaptiveRemediationItem>();

  for (const q of exercise.questions) {
    maxScore += q.points;
    const isCorrect = evaluateQuestionResponse(
      q.questionType,
      params.responses[q.id],
      q.answers
    );
    const pointsAwarded = isCorrect ? q.points : 0;
    score += pointsAwarded;

    if (q.conceptId) {
      const remediation = await recordConceptAttempt(
        params.userId,
        q.conceptId,
        isCorrect,
        db
      );
      if (remediation) {
        remediationByConcept.set(remediation.conceptId, remediation);
      }
    }

    const currentSkill = skillDeltas.get(q.skillType) ?? { correct: 0, total: 0 };
    currentSkill.total += 1;
    if (isCorrect) currentSkill.correct += 1;
    skillDeltas.set(q.skillType, currentSkill);

    const explanationVi = q.explanations[0]?.explanationVi ?? null;
    details.push({
      questionId: q.id,
      isCorrect,
      pointsAwarded,
      maxPoints: q.points,
      explanationVi,
      correctAnswer: q.answers[0]?.acceptedPayload ?? null,
    });

    if (!isCorrect) {
      wrongQuestionsForFlashcards.push({
        questionId: q.id,
        promptZh: q.promptZh,
        promptPinyin: q.promptPinyin,
        promptVi: q.promptVi,
        explanationVi,
      });
    }
  }

  const accuracyPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = accuracyPercent >= exercise.passingPercent;

  const attempt = await db.userExerciseAttempt.create({
    data: {
      userId: params.userId,
      exerciseId: exercise.id,
      score,
      maxScore,
      accuracyPercent,
      passed,
      answersSnapshot: params.responses as object,
      timeSpentSeconds: params.timeSpentSeconds ?? 0,
      clientMutationId: params.clientMutationId ?? null,
    },
  });

  // Update skill metrics
  for (const [skill, delta] of skillDeltas.entries()) {
    await recordSkillPerformance(
      params.userId,
      skill as never,
      delta.correct,
      delta.total,
      params.timeSpentSeconds ?? 0,
      db
    );
  }

  // Update lesson progress if attached to a lesson
  if (exercise.lessonId) {
    await updateLessonProgress(
      {
        userId: params.userId,
        lessonId: exercise.lessonId,
        completedSections: passed ? ["ASSESSMENT"] : [],
        status: passed ? "COMPLETED" : "NEEDS_REVIEW",
        lastScorePercent: accuracyPercent,
        addTimeSeconds: params.timeSpentSeconds ?? 0,
      },
      db
    );
  }

  // Automatically generate flashcards from wrong answers if user enabled it
  const settings = await db.userSetting.findUnique({ where: { userId: params.userId } });
  let generatedFlashcards = 0;
  if ((settings?.autoGenerateFlashcards ?? true) && wrongQuestionsForFlashcards.length > 0) {
    const gen = await generateFlashcardsFromIncorrectQuestions(
      params.userId,
      wrongQuestionsForFlashcards,
      db
    );
    generatedFlashcards = gen.createdCount;
  }

  return {
    attempt,
    details,
    generatedFlashcards,
    adaptiveRemediation: Array.from(remediationByConcept.values()),
    idempotent: false,
  };
}
