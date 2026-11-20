import {
  FlashcardSourceType,
  FsrsCardState,
  ReviewRating,
  type PrismaClient,
} from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/validation/api";
import { scheduleFlashcardReview } from "@/modules/flashcards/fsrs.service";

export async function ensureSystemDeck(
  userId: string,
  name: string,
  description: string,
  db: PrismaClient = defaultPrisma
) {
  return db.flashcardDeck.upsert({
    where: { userId_name: { userId, name } },
    update: {},
    create: {
      userId,
      name,
      description,
      isSystem: true,
    },
  });
}

export async function createCardFromSourceIfMissing(
  params: {
    userId: string;
    deckId: string;
    sourceType: FlashcardSourceType;
    sourceEntityId: string;
    frontZh: string;
    frontPinyin?: string | null;
    backVi: string;
    exampleZh?: string | null;
    exampleVi?: string | null;
    notesVi?: string | null;
    tags?: string[];
  },
  db: PrismaClient = defaultPrisma
): Promise<{ created: boolean; flashcardId: string }> {
  const existingSource = await db.flashcardSource.findUnique({
    where: {
      userId_sourceType_sourceEntityId: {
        userId: params.userId,
        sourceType: params.sourceType,
        sourceEntityId: params.sourceEntityId,
      },
    },
    select: { flashcardId: true },
  });

  if (existingSource) {
    return { created: false, flashcardId: existingSource.flashcardId };
  }

  const card = await db.flashcard.create({
    data: {
      userId: params.userId,
      deckId: params.deckId,
      frontZh: params.frontZh,
      frontPinyin: params.frontPinyin ?? null,
      backVi: params.backVi,
      exampleZh: params.exampleZh ?? null,
      exampleVi: params.exampleVi ?? null,
      notesVi: params.notesVi ?? null,
      tags: params.tags ?? [],
      source: {
        create: {
          userId: params.userId,
          sourceType: params.sourceType,
          sourceEntityId: params.sourceEntityId,
        },
      },
      state: {
        create: {
          state: FsrsCardState.NEW,
          dueAt: new Date(),
        },
      },
    },
    select: { id: true },
  });

  return { created: true, flashcardId: card.id };
}

export async function generateFlashcardsFromLesson(
  userId: string,
  lessonId: string,
  db: PrismaClient = defaultPrisma
) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      lessonVocabulary: {
        orderBy: { sortOrder: "asc" },
        include: {
          vocabulary: {
            include: {
              examples: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
      lessonGrammar: {
        orderBy: { sortOrder: "asc" },
        include: {
          grammarPoint: {
            include: {
              examples: { where: { isIncorrect: false }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError("Không tìm thấy bài học.", 404, "LESSON_NOT_FOUND");
  }

  const deck = await ensureSystemDeck(
    userId,
    `Bài học: ${lesson.titleVi}`,
    "Thẻ học tự động tạo từ từ vựng và ngữ pháp trong bài học.",
    db
  );

  let createdCount = 0;
  let skippedDuplicates = 0;

  for (const lv of lesson.lessonVocabulary) {
    const v = lv.vocabulary;
    const ex = v.examples[0];
    const res = await createCardFromSourceIfMissing(
      {
        userId,
        deckId: deck.id,
        sourceType: FlashcardSourceType.VOCABULARY,
        sourceEntityId: v.id,
        frontZh: v.simplified,
        frontPinyin: v.pinyin,
        backVi: v.primaryMeaningVi,
        exampleZh: ex?.sentenceZh,
        exampleVi: ex?.translationVi,
        notesVi: v.commonMistakesVi,
        tags: ["từ-vựng", lesson.slug],
      },
      db
    );
    if (res.created) createdCount++;
    else skippedDuplicates++;
  }

  for (const lg of lesson.lessonGrammar) {
    const g = lg.grammarPoint;
    const ex = g.examples[0];
    const res = await createCardFromSourceIfMissing(
      {
        userId,
        deckId: deck.id,
        sourceType: FlashcardSourceType.GRAMMAR,
        sourceEntityId: g.id,
        frontZh: g.patternZh,
        frontPinyin: g.patternPinyin,
        backVi: `${g.titleVi} — ${g.explanationVi}`,
        exampleZh: ex?.sentenceZh,
        exampleVi: ex?.translationVi,
        notesVi: g.commonErrorsVi,
        tags: ["ngữ-pháp", lesson.slug],
      },
      db
    );
    if (res.created) createdCount++;
    else skippedDuplicates++;
  }

  return { deckId: deck.id, deckName: deck.name, createdCount, skippedDuplicates };
}

export async function generateFlashcardsFromIncorrectQuestions(
  userId: string,
  wrongQuestions: Array<{
    questionId: string;
    promptZh?: string | null;
    promptPinyin?: string | null;
    promptVi?: string | null;
    explanationVi?: string | null;
  }>,
  db: PrismaClient = defaultPrisma
) {
  if (wrongQuestions.length === 0) return { createdCount: 0 };

  const deck = await ensureSystemDeck(
    userId,
    "Lỗi sai cần ôn tập",
    "Tự động thu thập từ các câu hỏi làm sai trong bài tập và đề thi HSK.",
    db
  );

  let createdCount = 0;
  for (const q of wrongQuestions) {
    const res = await createCardFromSourceIfMissing(
      {
        userId,
        deckId: deck.id,
        sourceType: FlashcardSourceType.INCORRECT_EXERCISE,
        sourceEntityId: q.questionId,
        frontZh: q.promptZh || q.promptVi || "Câu hỏi cần ôn",
        frontPinyin: q.promptPinyin,
        backVi: q.explanationVi || q.promptVi || "Xem lại kiến thức bài học",
        tags: ["lỗi-sai"],
      },
      db
    );
    if (res.created) createdCount++;
  }

  return { deckId: deck.id, createdCount };
}

export async function recordFlashcardReview(
  params: {
    userId: string;
    flashcardId: string;
    rating: ReviewRating;
    durationMs?: number;
    clientMutationId?: string;
    reviewedAt?: Date;
  },
  db: PrismaClient = defaultPrisma
) {
  if (params.clientMutationId) {
    const existingReview = await db.flashcardReview.findUnique({
      where: { clientMutationId: params.clientMutationId },
    });
    if (existingReview) {
      const currentState = await db.flashcardState.findUnique({
        where: { flashcardId: params.flashcardId },
      });
      return { review: existingReview, state: currentState, idempotent: true };
    }
  }

  const card = await db.flashcard.findFirst({
    where: { id: params.flashcardId, userId: params.userId, deletedAt: null },
    include: { state: true },
  });

  if (!card) {
    throw new AppError("Không tìm thấy thẻ Flashcard.", 404, "FLASHCARD_NOT_FOUND");
  }

  const now = params.reviewedAt ?? new Date();
  const stateBefore = card.state?.state ?? FsrsCardState.NEW;
  const computed = scheduleFlashcardReview(card.state, params.rating, now);

  const result = await db.$transaction(async (tx) => {
    const updatedState = await tx.flashcardState.upsert({
      where: { flashcardId: card.id },
      update: {
        stability: computed.stability,
        difficulty: computed.difficulty,
        elapsedDays: computed.elapsedDays,
        scheduledDays: computed.scheduledDays,
        reps: computed.reps,
        lapses: computed.lapses,
        state: computed.state,
        dueAt: computed.dueAt,
        lastReviewAt: computed.lastReviewAt,
      },
      create: {
        flashcardId: card.id,
        stability: computed.stability,
        difficulty: computed.difficulty,
        elapsedDays: computed.elapsedDays,
        scheduledDays: computed.scheduledDays,
        reps: computed.reps,
        lapses: computed.lapses,
        state: computed.state,
        dueAt: computed.dueAt,
        lastReviewAt: computed.lastReviewAt,
      },
    });

    const review = await tx.flashcardReview.create({
      data: {
        userId: params.userId,
        flashcardId: card.id,
        rating: params.rating,
        stateBefore,
        stateAfter: computed.state,
        stabilityAfter: computed.stability,
        difficultyAfter: computed.difficulty,
        scheduledDays: computed.scheduledDays,
        durationMs: params.durationMs ?? null,
        clientMutationId: params.clientMutationId ?? null,
        reviewedAt: now,
      },
    });

    return { review, state: updatedState, idempotent: false };
  });

  return result;
}
