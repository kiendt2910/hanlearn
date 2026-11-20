import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { FlashcardsManager } from "@/modules/flashcards/components/FlashcardsManager";

export const metadata: Metadata = {
  title: "Flashcards FSRS",
};

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const decks = await prisma.flashcardDeck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      flashcards: {
        where: { deletedAt: null, isSuspended: false },
        include: { state: { select: { dueAt: true } } },
      },
    },
  });

  const summaries = decks.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    isSystem: d.isSystem,
    totalCards: d.flashcards.length,
    dueCards: d.flashcards.filter((c) => !c.state || c.state.dueAt <= now).length,
  }));

  const totalDue = summaries.reduce((acc, s) => acc + s.dueCards, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Hệ thống Flashcards FSRS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ôn tập lặp lại ngắt quãng khoa học, tự động đồng bộ từ bài học và lỗi sai bài tập (chống tạo thẻ trùng lặp).
        </p>
      </div>

      <FlashcardsManager decks={summaries} totalDue={totalDue} />
    </div>
  );
}
