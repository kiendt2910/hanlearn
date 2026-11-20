import { NextRequest } from "next/server";
import { FlashcardSourceType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";
import {
  createCardFromSourceIfMissing,
  ensureSystemDeck,
  generateFlashcardsFromLesson,
} from "@/modules/flashcards/flashcard.service";

const generateSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("lesson"),
    lessonId: z.string().uuid(),
  }),
  z.object({
    mode: z.literal("vocabulary"),
    vocabularyId: z.string().uuid(),
  }),
  z.object({
    mode: z.literal("grammar"),
    grammarPointId: z.string().uuid(),
  }),
]);

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = generateSchema.parse(await request.json());

    if (body.mode === "lesson") {
      const res = await generateFlashcardsFromLesson(user.id, body.lessonId);
      return apiOk(res);
    }

    if (body.mode === "vocabulary") {
      const vocab = await prisma.vocabulary.findUnique({
        where: { id: body.vocabularyId },
        include: { examples: { take: 1, orderBy: { sortOrder: "asc" } } },
      });
      if (!vocab) throw new AppError("Không tìm thấy từ vựng.", 404, "VOCAB_NOT_FOUND");

      const deck = await ensureSystemDeck(
        user.id,
        "Từ vựng đã lưu",
        "Thẻ Flashcard tạo từ Kho từ vựng HanLearn."
      );
      const res = await createCardFromSourceIfMissing({
        userId: user.id,
        deckId: deck.id,
        sourceType: FlashcardSourceType.VOCABULARY,
        sourceEntityId: vocab.id,
        frontZh: vocab.simplified,
        frontPinyin: vocab.pinyin,
        backVi: vocab.primaryMeaningVi,
        exampleZh: vocab.examples[0]?.sentenceZh,
        exampleVi: vocab.examples[0]?.translationVi,
        notesVi: vocab.commonMistakesVi,
        tags: ["từ-vựng"],
      });
      return apiOk({ ...res, deckId: deck.id });
    }

    const grammar = await prisma.grammarPoint.findUnique({
      where: { id: body.grammarPointId },
      include: { examples: { where: { isIncorrect: false }, take: 1 } },
    });
    if (!grammar) throw new AppError("Không tìm thấy điểm ngữ pháp.", 404, "GRAMMAR_NOT_FOUND");

    const deck = await ensureSystemDeck(
      user.id,
      "Ngữ pháp trọng tâm",
      "Thẻ Flashcard tạo từ thư viện Ngữ pháp."
    );
    const res = await createCardFromSourceIfMissing({
      userId: user.id,
      deckId: deck.id,
      sourceType: FlashcardSourceType.GRAMMAR,
      sourceEntityId: grammar.id,
      frontZh: grammar.patternZh,
      frontPinyin: grammar.patternPinyin,
      backVi: `${grammar.titleVi}: ${grammar.explanationVi}`,
      exampleZh: grammar.examples[0]?.sentenceZh,
      exampleVi: grammar.examples[0]?.translationVi,
      notesVi: grammar.commonErrorsVi,
      tags: ["ngữ-pháp"],
    });
    return apiOk({ ...res, deckId: deck.id });
  } catch (error) {
    return handleApiError(error);
  }
}
