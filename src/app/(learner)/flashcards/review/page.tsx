import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { previewRatingIntervals } from "@/modules/flashcards/fsrs.service";
import { FsrsReviewSession } from "@/modules/flashcards/components/FsrsReviewSession";

export const metadata: Metadata = {
  title: "Ôn tập Flashcards (FSRS)",
};

export const dynamic = "force-dynamic";

export default async function FlashcardsReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ deckId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { deckId } = await searchParams;
  const now = new Date();

  const dueCards = await prisma.flashcard.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      isSuspended: false,
      ...(deckId ? { deckId } : {}),
      OR: [{ state: null }, { state: { dueAt: { lte: now } } }],
    },
    take: 40,
    orderBy: { createdAt: "asc" },
    include: {
      deck: { select: { name: true } },
      state: true,
    },
  });

  return (
    <FsrsReviewSession
      initialCards={dueCards.map((c) => ({
        id: c.id,
        deckName: c.deck.name,
        frontZh: c.frontZh,
        frontPinyin: c.frontPinyin,
        backVi: c.backVi,
        exampleZh: c.exampleZh,
        exampleVi: c.exampleVi,
        notesVi: c.notesVi,
        stateLabel: c.state?.state ?? "NEW",
        stability: c.state?.stability ?? 0,
        difficulty: c.state?.difficulty ?? 0,
        intervalPreviews: previewRatingIntervals(c.state, now),
      }))}
    />
  );
}
