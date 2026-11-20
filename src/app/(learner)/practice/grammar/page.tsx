import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { GrammarLibrary } from "@/modules/grammar/components/GrammarLibrary";

export const metadata: Metadata = {
  title: "Thư viện Ngữ pháp tiếng Trung",
};

export const dynamic = "force-dynamic";

export default async function GrammarPage() {
  const grammarList = await prisma.grammarPoint.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ learningLevel: { sortOrder: "asc" } }, { createdAt: "asc" }],
    include: {
      learningLevel: { select: { titleVi: true } },
      examples: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Ngữ pháp tiếng Trung trọng tâm</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Giải thích cấu trúc bằng tiếng Việt dễ hiểu, đối chiếu thói quen diễn đạt và chỉ rõ lỗi sai phổ biến.
        </p>
      </div>

      <GrammarLibrary
        items={grammarList.map((g) => ({
          ...g,
          levelTitleVi: g.learningLevel?.titleVi ?? null,
        }))}
      />
    </div>
  );
}
