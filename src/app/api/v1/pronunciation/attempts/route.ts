import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { recordSkillPerformance, touchUserStreak } from "@/modules/progress/progress.service";

const pronunciationSchema = z.object({
  targetTextZh: z.string().trim().min(1).max(300),
  targetPinyin: z.string().trim().min(1).max(300),
  durationMs: z.number().int().min(0).max(120000).optional(),
  recognizedTranscriptZh: z.string().trim().nullable().optional(),
});

function computeCharacterOverlap(target: string, actual: string): number {
  const cleanTarget = target.replace(/[^\u4e00-\u9fff]/g, "");
  const cleanActual = actual.replace(/[^\u4e00-\u9fff]/g, "");
  if (!cleanTarget) return 0;
  let matches = 0;
  for (const ch of cleanTarget) {
    if (cleanActual.includes(ch)) matches++;
  }
  return Math.round((matches / cleanTarget.length) * 100);
}

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const attempts = await prisma.pronunciationAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { feedback: true },
    });
    return apiOk(attempts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = pronunciationSchema.parse(await request.json());

    const hasStt = Boolean(body.recognizedTranscriptZh);
    const matchPercent = hasStt
      ? computeCharacterOverlap(body.targetTextZh, body.recognizedTranscriptZh ?? "")
      : null;

    const attempt = await prisma.pronunciationAttempt.create({
      data: {
        userId: user.id,
        targetTextZh: body.targetTextZh,
        targetPinyin: body.targetPinyin,
        durationMs: body.durationMs ?? null,
        feedback: {
          create: {
            evaluationMode: hasStt ? "STT_RECOGNITION" : "SELF_COMPARE",
            recognizedTranscriptZh: body.recognizedTranscriptZh ?? null,
            transcriptMatchPercent: matchPercent,
            toneScoringSupported: false,
            feedbackVi: hasStt
              ? `Nhận diện văn bản khớp khoảng ${matchPercent}% ký tự mục tiêu. Hãy phát lại bản ghi để tự kiểm tra thanh điệu.`
              : "Đã lưu lượt ghi âm luyện đọc. Hãy nghe lại bản ghi và so sánh trực tiếp với âm thanh mẫu.",
            limitationNoticeVi:
              "Hệ thống hiện phân tách rõ nhận diện văn bản (STT) với đánh giá thanh điệu; không đưa ra điểm thanh điệu khi chưa tích hợp dịch vụ chấm thanh điệu chuyên biệt.",
          },
        },
      },
      include: { feedback: true },
    });

    await recordSkillPerformance(
      user.id,
      "PRONUNCIATION",
      matchPercent !== null && matchPercent >= 70 ? 1 : 0,
      1,
      Math.max(10, Math.round((body.durationMs ?? 5000) / 1000))
    );
    await touchUserStreak(user.id);

    return apiOk(attempt, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
