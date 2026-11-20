import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { AiTutorChat } from "@/modules/ai-tutor/components/AiTutorChat";

export const metadata: Metadata = {
  title: "Gia sư AI tiếng Trung",
};

export const dynamic = "force-dynamic";

export default async function AiTutorPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const conversations = await prisma.aiConversation.findMany({
    where: { userId: user.id, deletedAt: null, mode: { not: "TOPIC_CONVERSATION" } },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gia sư AI tiếng Trung</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Giải thích từ vựng, ngữ pháp bằng tiếng Việt, sửa câu sai tự nhiên và lưu lịch sử trò chuyện do bạn kiểm soát xóa.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/ai-tutor/conversation">Chuyển sang Hội thoại theo chủ đề</Link>
        </Button>
      </div>

      <AiTutorChat initialConversations={conversations} defaultMode="TUTOR_QA" />
    </div>
  );
}
