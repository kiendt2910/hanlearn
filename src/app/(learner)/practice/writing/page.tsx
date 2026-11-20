import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { WritingWorkspace } from "@/modules/writing/components/WritingWorkspace";

export const metadata: Metadata = {
  title: "Luyện Viết & Nét chữ Hán",
};

export const dynamic = "force-dynamic";

export default async function WritingPracticePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [characters, submissions] = await Promise.all([
    prisma.character.findMany({
      orderBy: { strokeCount: "asc" },
      include: { strokes: { orderBy: { strokeOrder: "asc" } } },
    }),
    prisma.writingSubmission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { feedback: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Luyện Viết tiếng Trung & Thứ tự nét</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tập viết chữ Hán theo bút thuận chuẩn, luyện đặt câu – viết đoạn và lưu lịch sử chỉnh sửa cùng nhận xét tiếng Việt.
        </p>
      </div>

      <WritingWorkspace
        characters={characters}
        initialSubmissions={submissions.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
          feedback: s.feedback.map((f) => ({
            id: f.id,
            correctedVersionZh: f.correctedVersionZh,
            grammarIssues: (f.grammarIssues ?? []) as Array<{
              span: string;
              explanationVi: string;
              suggestion: string;
            }>,
            vocabSuggestions: (f.vocabSuggestions ?? []) as Array<{
              original: string;
              suggested: string;
              reasonVi: string;
            }>,
            naturalnessFeedback: f.naturalnessFeedback,
            overallExplanationVi: f.overallExplanationVi,
            recommendationsVi: (f.recommendationsVi ?? []) as string[],
          })),
        }))}
      />
    </div>
  );
}
