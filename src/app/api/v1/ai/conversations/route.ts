import { NextRequest } from "next/server";
import { AiConversationMode } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { CONVERSATION_TOPICS } from "@/modules/ai-tutor/ai-provider.service";

const createConvSchema = z.object({
  mode: z.nativeEnum(AiConversationMode).default(AiConversationMode.TUTOR_QA),
  topic: z.string().trim().max(60).optional(),
  title: z.string().trim().min(1).max(120).optional(),
});

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const conversations = await prisma.aiConversation.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 50 },
      },
    });
    return apiOk(conversations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = createConvSchema.parse(await request.json());

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { currentLevel: { select: { titleVi: true } } },
    });

    const topicObj = CONVERSATION_TOPICS.find((t) => t.id === body.topic);
    const title =
      body.title ||
      (topicObj ? `Hội thoại: ${topicObj.labelVi}` : "Phiên hỏi đáp Gia sư AI");

    const conversation = await prisma.aiConversation.create({
      data: {
        userId: user.id,
        mode: body.mode,
        topic: body.topic ?? null,
        learnerLevel: profile?.currentLevel?.titleVi ?? "Sơ cấp (HSK 1)",
        title,
        messages: topicObj
          ? {
              create: {
                role: "assistant",
                content: `${topicObj.sampleZh}\n(${topicObj.samplePinyin})\n\nHãy trả lời câu mở đầu trên bằng tiếng Trung giản thể hoặc Pinyin để bắt đầu luyện hội thoại chủ đề "${topicObj.labelVi}".`,
                providerName: "hanlearn-topic-starter",
              },
            }
          : undefined,
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return apiOk(conversation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
