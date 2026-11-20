import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { VocabularyExplorer } from "@/modules/vocabulary/components/VocabularyExplorer";

export const metadata: Metadata = {
  title: "Kho từ vựng tiếng Trung",
};

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [vocabList, userProgress] = await Promise.all([
    prisma.vocabulary.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ learningLevel: { sortOrder: "asc" } }, { createdAt: "asc" }],
      include: {
        learningLevel: { select: { titleVi: true } },
        examples: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.userVocabularyProgress.findMany({ where: { userId: user.id } }),
  ]);

  const bookmarkSet = new Set(
    userProgress.filter((p) => p.isBookmarked).map((p) => p.vocabularyId)
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Kho Từ vựng HanLearn</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Từ vựng chuẩn hóa kèm chữ Hán giản thể, Pinyin dấu thanh, nghĩa tiếng Việt, ví dụ ngữ cảnh và phát âm.
        </p>
      </div>

      <VocabularyExplorer
        items={vocabList.map((v) => ({
          id: v.id,
          simplified: v.simplified,
          traditional: v.traditional,
          pinyin: v.pinyin,
          pinyinNumbered: v.pinyinNumbered,
          partOfSpeech: v.partOfSpeech,
          primaryMeaningVi: v.primaryMeaningVi,
          primaryMeaningEn: v.primaryMeaningEn,
          commonMistakesVi: v.commonMistakesVi,
          levelTitleVi: v.learningLevel?.titleVi ?? null,
          isBookmarked: bookmarkSet.has(v.id),
          example: v.examples[0] ?? null,
        }))}
      />
    </div>
  );
}
