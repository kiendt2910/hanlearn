import { NextRequest } from "next/server";
import { WritingTaskType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { createAndEvaluateWritingSubmission } from "@/modules/writing/writing.service";

const writingSchema = z.object({
  taskType: z.nativeEnum(WritingTaskType).default(WritingTaskType.SENTENCE_CONSTRUCTION),
  promptText: z.string().trim().max(500).optional(),
  submittedText: z.string().trim().min(1, "Vui lòng nhập bài viết tiếng Trung.").max(4000),
  lessonId: z.string().uuid().optional(),
  parentSubmissionId: z.string().uuid().optional(),
});

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const submissions = await prisma.writingSubmission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { feedback: true },
    });
    return apiOk(submissions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = writingSchema.parse(await request.json());

    const result = await createAndEvaluateWritingSubmission({
      userId: user.id,
      taskType: body.taskType,
      promptText: body.promptText,
      submittedText: body.submittedText,
      lessonId: body.lessonId,
      parentSubmissionId: body.parentSubmissionId,
    });

    return apiOk(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
