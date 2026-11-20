import { WritingTaskType, type PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";
import { generateAiTutorReply } from "@/modules/ai-tutor/ai-provider.service";
import { recordSkillPerformance, touchUserStreak } from "@/modules/progress/progress.service";

export async function createAndEvaluateWritingSubmission(
  params: {
    userId: string;
    taskType: WritingTaskType;
    promptText?: string;
    submittedText: string;
    lessonId?: string;
    parentSubmissionId?: string;
  },
  db: PrismaClient = defaultPrisma
) {
  let revisionNumber = 1;
  if (params.parentSubmissionId) {
    const parent = await db.writingSubmission.findFirst({
      where: { id: params.parentSubmissionId, userId: params.userId },
      select: { revisionNumber: true },
    });
    if (parent) {
      revisionNumber = parent.revisionNumber + 1;
    }
  }

  const trimmed = params.submittedText.trim();
  const hanziMatches = trimmed.match(/[\u4e00-\u9fff]/g) ?? [];

  const submission = await db.writingSubmission.create({
    data: {
      userId: params.userId,
      lessonId: params.lessonId ?? null,
      parentSubmissionId: params.parentSubmissionId ?? null,
      revisionNumber,
      taskType: params.taskType,
      promptText: params.promptText ?? null,
      submittedText: trimmed,
      characterCount: hanziMatches.length || trimmed.length,
    },
  });

  // Deterministic Chinese error checks tailored to Vietnamese learners
  const grammarIssues: Array<{ span: string; explanationVi: string; suggestion: string }> = [];
  const vocabSuggestions: Array<{ original: string; suggested: string; reasonVi: string }> = [];
  let correctedVersionZh = trimmed;

  if (correctedVersionZh.includes("我是叫")) {
    grammarIssues.push({
      span: "我是叫",
      explanationVi: "Không đặt động từ 是 trước 叫 khi giới thiệu tên.",
      suggestion: "我叫",
    });
    correctedVersionZh = correctedVersionZh.replaceAll("我是叫", "我叫");
  }

  if (/我是很[\u4e00-\u9fff]/.test(correctedVersionZh)) {
    grammarIssues.push({
      span: "我是很...",
      explanationVi: "Trong tiếng Trung, không dùng 是 trực tiếp trước tính từ đi kèm 很.",
      suggestion: "我很...",
    });
    correctedVersionZh = correctedVersionZh.replace(/我是很/g, "我很");
  }

  if (correctedVersionZh.includes("二个")) {
    grammarIssues.push({
      span: "二个",
      explanationVi: "Trước lượng từ 个 cần dùng 两 (liǎng) thay cho 二 (èr).",
      suggestion: "两个",
    });
    correctedVersionZh = correctedVersionZh.replaceAll("二个", "两个");
  }

  if (correctedVersionZh.includes("吗") && /(什么|几|多少|谁|哪)/.test(correctedVersionZh)) {
    grammarIssues.push({
      span: "...吗",
      explanationVi: "Câu đã có đại từ nghi vấn (什么/几/多少/谁/哪) thì không thêm trợ từ 吗 ở cuối câu.",
      suggestion: "Bỏ 吗 ở cuối câu",
    });
    correctedVersionZh = correctedVersionZh.replaceAll("吗", "");
  }

  if (correctedVersionZh.includes("我的家")) {
    vocabSuggestions.push({
      original: "我的家",
      suggested: "我家",
      reasonVi: "Với danh từ chỉ gia đình/người thân, lược bỏ 的 giúp câu tự nhiên hơn trong văn nói.",
    });
  }

  if (hanziMatches.length > 0 && !/[。！？!?]$/.test(correctedVersionZh)) {
    correctedVersionZh = `${correctedVersionZh}。`;
  }

  let overallExplanationVi =
    grammarIssues.length === 0
      ? "Bài viết của bạn không phát hiện lỗi ngữ pháp sơ cấp phổ biến. Hãy đối chiếu thêm độ tự nhiên và dấu câu tiếng Trung (。 ， ？)."
      : `Hệ thống phát hiện ${grammarIssues.length} điểm ngữ pháp cần chỉnh sửa để câu đúng chuẩn và tự nhiên hơn.`;

  const naturalnessFeedback =
    hanziMatches.length === 0
      ? "Bạn chưa nhập ký tự chữ Hán (chỉ có Latin/Pinyin). Hãy luyện nhập bằng bộ gõ Pinyin sang chữ Hán giản thể."
      : `Bài viết có ${hanziMatches.length} chữ Hán. Độ rõ ràng phù hợp mức thực hành.`;

  let providerName = "hanlearn-writing-analyzer";

  // Optionally enrich with configured external AI provider if available
  try {
    const ai = await generateAiTutorReply({
      userId: params.userId,
      mode: "WRITING_COACH",
      messages: [
        {
          role: "user",
          content: `Hãy nhận xét ngắn gọn bằng tiếng Việt (ngữ pháp, cách dùng từ tự nhiên và bản sửa) cho đoạn viết tiếng Trung sau:\nĐề bài: ${
            params.promptText ?? "Viết tự do"
          }\nBài viết: ${trimmed}`,
        },
      ],
    });
    if (ai.usedExternalProvider) {
      overallExplanationVi = ai.content;
      providerName = `${ai.providerName}:${ai.modelName}`;
    }
  } catch {
    // Keep deterministic analysis if external AI fails or exceeds quota
  }

  const recommendationsVi = [
    hanziMatches.length < 6
      ? "Thử mở rộng thêm 1–2 câu hoàn chỉnh có trạng ngữ chỉ thời gian (今天, 每天) để luyện kết nối ý."
      : "Tạo một bản chỉnh sửa mới (Revision) từ bản gốc này để ghi nhớ điểm vừa sửa.",
    "Đọc to lại bản đã sửa ở mục Luyện Phát âm để củng cố trí nhớ âm thanh – mặt chữ.",
  ];

  const feedback = await db.writingFeedback.create({
    data: {
      submissionId: submission.id,
      correctedVersionZh,
      grammarIssues,
      vocabSuggestions,
      naturalnessFeedback,
      overallExplanationVi,
      recommendationsVi,
      providerName,
    },
  });

  await recordSkillPerformance(
    params.userId,
    "WRITING",
    grammarIssues.length === 0 && hanziMatches.length > 0 ? 1 : 0,
    1,
    120,
    db
  );
  await touchUserStreak(params.userId, db);

  return { submission, feedback };
}
