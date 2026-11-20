import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { VoiceRecorderCompare } from "@/components/chinese/VoiceRecorderCompare";

export const metadata: Metadata = {
  title: "Luyện Nói tiếng Trung",
};

export const dynamic = "force-dynamic";

export default async function SpeakingPracticePage() {
  const sections = await prisma.lessonSection.findMany({
    where: { sectionType: "SPEAKING", lesson: { status: "PUBLISHED" } },
    include: { lesson: { select: { titleVi: true } } },
    orderBy: { createdAt: "asc" },
  });

  const prompts = sections.flatMap((sec) => {
    const payload = sec.contentPayload as {
      prompts?: Array<{ zh: string; pinyin: string; vi: string }>;
    };
    return (payload?.prompts ?? []).map((p) => ({
      ...p,
      lessonTitle: sec.lesson.titleVi,
    }));
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Luyện Nói (Nghe & Nhắc lại)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nghe phát âm mẫu, ghi âm trực tiếp câu nói của bạn và phát lại để cải thiện ngữ điệu, độ trôi chảy.
        </p>
      </div>

      <div className="space-y-4">
        {prompts.map((item, idx) => (
          <VoiceRecorderCompare
            key={idx}
            targetTextZh={item.zh}
            targetPinyin={item.pinyin}
            meaningVi={`${item.vi} (${item.lessonTitle})`}
          />
        ))}
      </div>
    </div>
  );
}
