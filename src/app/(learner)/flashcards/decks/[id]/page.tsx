import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;

  const deck = await prisma.flashcardDeck.findFirst({
    where: { id, userId: user.id },
    include: {
      flashcards: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { state: true, _count: { select: { reviews: true } } },
      },
    },
  });

  if (!deck) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <Link
            href="/flashcards"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại bộ thẻ
          </Link>
          <h1 className="mt-1 text-xl font-bold text-foreground">{deck.name}</h1>
          {deck.description ? (
            <p className="text-sm text-muted-foreground">{deck.description}</p>
          ) : null}
        </div>
        <Button asChild>
          <Link href={`/flashcards/review?deckId=${deck.id}`}>Ôn tập bộ thẻ này</Link>
        </Button>
      </div>

      <div className="space-y-2.5">
        {deck.flashcards.map((card) => (
          <Card key={card.id}>
            <CardContent className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-baseline gap-2">
                  <span lang="zh-Hans" className="font-hanzi text-xl font-bold">
                    {card.frontZh}
                  </span>
                  {card.frontPinyin ? (
                    <span className="font-pinyin text-xs text-primary">{card.frontPinyin}</span>
                  ) : null}
                </div>
                <p className="text-sm text-foreground">{card.backVi}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{card.state?.state ?? "NEW"}</Badge>
                <span>Ôn: {card._count.reviews} lần</span>
                <span>
                  Hạn tiếp:{" "}
                  {card.state?.dueAt
                    ? card.state.dueAt.toLocaleDateString("vi-VN")
                    : "Hôm nay"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
