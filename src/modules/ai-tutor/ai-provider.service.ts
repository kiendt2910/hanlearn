import { prisma } from "@/lib/db/prisma";
import { globalRateLimiter } from "@/lib/rate-limit/memory-rate-limiter";
import { AppError } from "@/lib/validation/api";

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionResult {
  content: string;
  providerName: string;
  modelName: string;
  inputTokens?: number;
  outputTokens?: number;
  usedExternalProvider: boolean;
}

export const CONVERSATION_TOPICS = [
  { id: "greetings", labelVi: "Chào hỏi & Làm quen", sampleZh: "你好！很高兴认识你，你叫什么名字？", samplePinyin: "Nǐ hǎo! Hěn gāoxìng rènshi nǐ, nǐ jiào shénme míngzi?" },
  { id: "family", labelVi: "Gia đình", sampleZh: "你家有几口人？他们都做什么工作？", samplePinyin: "Nǐ jiā yǒu jǐ kǒu rén? Tāmen dōu zuò shénme gōngzuò?" },
  { id: "food", labelVi: "Ẩm thực & Gọi món", sampleZh: "欢迎光临！请问您今天想吃点儿什么？", samplePinyin: "Huānyíng guānglín! Qǐngwèn nín jīntiān xiǎng chī diǎnr shénme?" },
  { id: "shopping", labelVi: "Mua sắm", sampleZh: "您好，您想买什么？这件衣服现在很便宜。", samplePinyin: "Nín hǎo, nín xiǎng mǎi shénme? Zhè jiàn yīfu xiànzài hěn piányi." },
  { id: "travel", labelVi: "Du lịch & Đi lại", sampleZh: "请问您去过中国吗？您最想去哪个城市？", samplePinyin: "Qǐngwèn nín qùguo Zhōngguó ma? Nín zuì xiǎng qù nǎge chéngshì?" },
  { id: "daily_life", labelVi: "Sinh hoạt hằng ngày", sampleZh: "你每天早上几点起床？平时怎么学习汉语？", samplePinyin: "Nǐ měitiān zǎoshang jǐ diǎn qǐchuáng? Píngshí zěnme xuéxí hànyǔ?" },
  { id: "school", labelVi: "Trường học & Học tập", sampleZh: "你在学校学习什么专业？汉语课难不难？", samplePinyin: "Nǐ zài xuéxiào xuéxí shénme zhuānyè? Hànyǔ kè nán bù nán?" },
  { id: "work", labelVi: "Công việc & Văn phòng", sampleZh: "你现在在哪里工作？平时工作忙吗？", samplePinyin: "Nǐ xiànzài zài nǎlǐ gōngzuò? Píngshí gōngzuò máng ma?" },
  { id: "business", labelVi: "Thương mại & Đối tác", sampleZh: "您好，很高兴今天能和贵公司讨论合作计划。", samplePinyin: "Nín hǎo, hěn gāoxìng jīntiān néng hé guì gōngsī tǎolùn hézuò jìhuà." },
] as const;

export function buildTutorSystemPrompt(params: {
  mode: string;
  learnerLevel?: string | null;
  topic?: string | null;
}): string {
  const level = params.learnerLevel || "Sơ cấp (HSK 1-2)";
  const topicNote = params.topic ? `Chủ đề hội thoại hiện tại: ${params.topic}.` : "";

  return [
    "Bạn là Gia sư tiếng Trung HanLearn dành cho người Việt.",
    `Trình độ người học hiện tại: ${level}. ${topicNote}`,
    "Nguyên tắc sư phạm bắt buộc:",
    "1. Giải thích rõ ràng, lịch sự bằng tiếng Việt, phù hợp trình độ người học (tránh dùng thuật ngữ ngôn ngữ học quá hàn lâm).",
    "2. Mọi ví dụ tiếng Trung phải kèm chữ Hán giản thể, Pinyin có dấu thanh và bản dịch tiếng Việt.",
    "3. Khi sửa câu sai, giải thích vì sao sai, phân biệt rõ giữa 'đúng ngữ pháp' và 'tự nhiên như người bản xứ'.",
    "4. Không bịa đặt thông tin hay đưa ra tuyên bố không có cơ sở.",
  ].join("\n");
}

async function resolveAiRuntimeConfig() {
  const dbConfig = await prisma.systemSetting.findUnique({
    where: { key: "ai.provider_config" },
  });
  const saved = (dbConfig?.value ?? {}) as Record<string, string | number | undefined>;

  return {
    provider: String(saved.provider || process.env.AI_PROVIDER || "openai-compatible"),
    baseUrl: String(saved.baseUrl || process.env.AI_API_BASE_URL || ""),
    apiKey: String(saved.apiKey || process.env.AI_API_KEY || ""),
    model: String(saved.model || process.env.AI_MODEL || ""),
    dailyUserLimit: Number(saved.dailyUserLimit || process.env.AI_DAILY_USER_LIMIT || 30),
  };
}

export async function generateAiTutorReply(params: {
  userId: string;
  mode: string;
  learnerLevel?: string | null;
  topic?: string | null;
  messages: AiChatMessage[];
}): Promise<AiCompletionResult> {
  const config = await resolveAiRuntimeConfig();

  // Per-user rate limiting
  const rate = globalRateLimiter.check(`ai:user:${params.userId}`, {
    windowMs: 60 * 1000,
    maxRequests: 12,
  });
  if (!rate.allowed) {
    throw new AppError(
      "Bạn gửi yêu cầu Gia sư AI quá nhanh. Vui lòng đợi một phút rồi thử lại.",
      429,
      "AI_RATE_LIMITED"
    );
  }

  // Daily quota check in PostgreSQL
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await prisma.aiMessage.count({
    where: {
      role: "user",
      createdAt: { gte: startOfDay },
      conversation: { userId: params.userId },
    },
  });
  if (todayCount >= config.dailyUserLimit) {
    throw new AppError(
      `Bạn đã đạt giới hạn ${config.dailyUserLimit} lượt hỏi Gia sư AI trong ngày hôm nay.`,
      429,
      "AI_DAILY_QUOTA_EXCEEDED"
    );
  }

  const systemPrompt = buildTutorSystemPrompt({
    mode: params.mode,
    learnerLevel: params.learnerLevel,
    topic: params.topic,
  });

  // External Provider Call (OpenAI-compatible or Gemini REST)
  if (config.apiKey && config.model) {
    try {
      if (config.provider === "gemini") {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          config.model
        )}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
        const contents = params.messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
          }),
        });
        if (!res.ok) {
          throw new Error(`Gemini API HTTP ${res.status}`);
        }
        const json = await res.json();
        const text =
          json?.candidates?.[0]?.content?.parts?.[0]?.text ??
          "Xin lỗi, tôi chưa nhận được phản hồi hợp lệ từ nhà cung cấp AI.";
        return {
          content: text,
          providerName: "gemini",
          modelName: config.model,
          inputTokens: json?.usageMetadata?.promptTokenCount,
          outputTokens: json?.usageMetadata?.candidatesTokenCount,
          usedExternalProvider: true,
        };
      } else {
        const base = (config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
        const res = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            temperature: 0.4,
            max_tokens: 1024,
            messages: [{ role: "system", content: systemPrompt }, ...params.messages],
          }),
        });
        if (!res.ok) {
          throw new Error(`OpenAI-compatible API HTTP ${res.status}`);
        }
        const json = await res.json();
        const text =
          json?.choices?.[0]?.message?.content ??
          "Xin lỗi, tôi chưa nhận được phản hồi hợp lệ từ nhà cung cấp AI.";
        return {
          content: text,
          providerName: config.provider,
          modelName: config.model,
          inputTokens: json?.usage?.prompt_tokens,
          outputTokens: json?.usage?.completion_tokens,
          usedExternalProvider: true,
        };
      }
    } catch (error) {
      console.error("[HanLearn AI Provider Error]", error);
      throw new AppError(
        "Không thể kết nối nhà cung cấp AI đã cấu hình. Vui lòng kiểm tra cấu hình hoặc thử lại sau.",
        502,
        "AI_PROVIDER_ERROR"
      );
    }
  }

  // Honest Local Knowledge-Base Assisted Guidance when external AI API key is not configured
  const latestUserText = params.messages[params.messages.length - 1]?.content ?? "";
  const matchedVocab = await prisma.vocabulary.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { simplified: { contains: latestUserText.trim().slice(0, 12) } },
        { primaryMeaningVi: { contains: latestUserText.trim().slice(0, 12), mode: "insensitive" } },
      ],
    },
    take: 3,
    include: { examples: { take: 1 } },
  });

  const guidanceLines: string[] = [];

  if (params.mode === "TOPIC_CONVERSATION") {
    const topicMeta = CONVERSATION_TOPICS.find((t) => t.id === params.topic);
    guidanceLines.push(
      `【Phản hồi luyện hội thoại — Chủ đề: ${topicMeta?.labelVi ?? "Giao tiếp cơ bản"}】`,
      `Câu bạn vừa gửi: "${latestUserText}"`,
      ""
    );
    if (/我是叫/.test(latestUserText)) {
      guidanceLines.push(
        "• Góp ý sửa lỗi ngữ pháp: Không dùng '是' trước '叫'. Hãy viết: 我叫... (Wǒ jiào...)."
      );
    } else if (/你是.*吗/.test(latestUserText) || /你好/.test(latestUserText)) {
      guidanceLines.push(
        "• Gợi ý đáp lại tự nhiên: 你好！我很好，谢谢你。你今天怎么样？ (Nǐ hǎo! Wǒ hěn hǎo, xièxie nǐ. Nǐ jīntiān zěnmeyàng? — Chào bạn! Mình rất khỏe, cảm ơn bạn. Hôm nay bạn thế nào?)"
      );
    } else {
      guidanceLines.push(
        `• Gợi ý tiếp nối hội thoại: ${topicMeta?.sampleZh ?? "很好！你能再多说一句吗？"} (${topicMeta?.samplePinyin ?? "Hěn hǎo! Nǐ néng zài duō shuō yí jù ma?"})`
      );
    }
  } else {
    guidanceLines.push("【Phân tích học thuật từ kho dữ liệu HanLearn】");
    if (matchedVocab.length > 0) {
      for (const v of matchedVocab) {
        guidanceLines.push(
          `• ${v.simplified} (${v.pinyin}): ${v.primaryMeaningVi}${
            v.commonMistakesVi ? `\n  Lưu ý lỗi thường gặp: ${v.commonMistakesVi}` : ""
          }${
            v.examples[0]
              ? `\n  Ví dụ: ${v.examples[0].sentenceZh} (${v.examples[0].pinyin}) — ${v.examples[0].translationVi}`
              : ""
          }`
        );
      }
    } else {
      if (/我是叫/.test(latestUserText)) {
        guidanceLines.push(
          "• Phát hiện lỗi phổ biến: '我是叫...' bị dư động từ '是'. Câu đúng và tự nhiên là: 我叫... (Wǒ jiào...)."
        );
      } else if (/我是很/.test(latestUserText)) {
        guidanceLines.push(
          "• Phát hiện lỗi phổ biến: Trong tiếng Trung không dùng '是' trực tiếp trước tính từ + 很. Hãy bỏ '是' (ví dụ: 我很好 thay vì 我是很好)."
        );
      } else if (/二个/.test(latestUserText)) {
        guidanceLines.push(
          "• Phát hiện lỗi lượng từ: Trước lượng từ '个', số 2 dùng 两 (liǎng), không dùng 二 → 两个 (liǎng gè)."
        );
      } else {
        guidanceLines.push(
          `• Đã ghi nhận câu hỏi của bạn: "${latestUserText}".`,
          "• Mẹo học hiệu quả: Hãy thử đặt câu với mẫu '主语 + 想 + 动词' hoặc '主语 + 是 + 名词' và kiểm tra lại thanh điệu."
        );
      }
    }
  }

  guidanceLines.push(
    "",
    "ℹ️ Lưu ý hệ thống: Quản trị viên chưa cấu hình khóa API cho nhà cung cấp AI ngoài (AI_API_KEY / /admin/ai-config), nên phản hồi trên được tạo từ bộ quy tắc ngữ pháp & kho từ vựng cục bộ của HanLearn."
  );

  return {
    content: guidanceLines.join("\n"),
    providerName: "hanlearn-local-rules",
    modelName: "rule-assisted-fallback",
    usedExternalProvider: false,
  };
}
