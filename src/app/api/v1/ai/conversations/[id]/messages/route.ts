import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, AppError, handleApiError } from "@/lib/validation/api";
import { generateAiTutorReply } from "@/modules/ai-tutor/ai-provider.service";

const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Vui lòng nhập nội dung.").max(2000),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const body = sendMessageSchema.parse(await request.json());

    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 16 } },
    });
    if (!conversation) {
      throw new AppError("Không tìm thấy phiên trò chuyện.", 404, "CONVERSATION_NOT_FOUND");
    }

    const userMessage = await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: body.content,
      },
    });

    const history = [
      ...conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: body.content },
    ];

    const reply = await generateAiTutorReply({
      userId: user.id,
      mode: conversation.mode,
      learnerLevel: conversation.learnerLevel,
      topic: conversation.topic,
      messages: history,
    });

    const assistantMessage = await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: reply.content,
        providerName: reply.providerName,
        modelName: reply.modelName,
        inputTokens: reply.inputTokens ?? null,
        outputTokens: reply.outputTokens ?? null,
      },
    });

    await prisma.aiConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return apiOk({ userMessage, assistantMessage }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
