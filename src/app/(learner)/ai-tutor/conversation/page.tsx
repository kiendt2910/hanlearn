import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { AiTutorChat } from "@/modules/ai-tutor/components/AiTutorChat";

export const metadata: Metadata = {
  title: "Luyện Hội thoại theo Chủ đề",
};

export const dynamic = "force-dynamic";

export default async function AiConversationPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const conversations = await prisma.aiConversation.findMany({
    where: { userId: user.id, deletedAt: null, mode: "TOPIC_CONVERSATION" },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Luyện Hội thoại tiếng Trung theo Chủ đề</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn 1 trong 9 tình huống giao tiếp thực tế (Chào hỏi, Gia đình, Ẩm thực, Mua sắm, Du lịch, Đời sống, Trường học, Công việc, Thương mại).
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/ai-tutor">Về Hỏi đáp Gia sư AI</Link>
        </Button>
      </div>

      <AiTutorChat initialConversations={conversations} defaultMode="TOPIC_CONVERSATION" />
    </div>
  );
}
