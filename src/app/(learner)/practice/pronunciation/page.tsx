import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { PronunciationStudio } from "@/modules/pronunciation/components/PronunciationStudio";

export const metadata: Metadata = {
  title: "Phòng Luyện Phát âm & Thanh điệu",
};

export const dynamic = "force-dynamic";

export default async function PronunciationPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const attempts = await prisma.pronunciationAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
    include: { feedback: true },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Luyện Phát âm & Thanh điệu tiếng Trung</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nghe âm thanh mẫu với tốc độ điều chỉnh, ghi âm giọng đọc, phát lại so sánh trực tiếp và xem lịch sử luyện tập.
        </p>
      </div>

      <PronunciationStudio
        history={attempts.map((a) => ({
          id: a.id,
          targetTextZh: a.targetTextZh,
          targetPinyin: a.targetPinyin,
          createdAt: a.createdAt.toISOString(),
          feedback: a.feedback,
        }))}
      />
    </div>
  );
}
