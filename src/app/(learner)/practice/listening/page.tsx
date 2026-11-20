import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";

export const metadata: Metadata = {
  title: "Luyện Nghe tiếng Trung",
};

export const dynamic = "force-dynamic";

export default async function ListeningPracticePage() {
  const sections = await prisma.lessonSection.findMany({
    where: { sectionType: "LISTENING", lesson: { status: "PUBLISHED" } },
    include: { lesson: { select: { slug: true, titleVi: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Luyện Nghe hiểu & Hội thoại</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nghe hội thoại chuẩn theo từng bài học với điều khiển tốc độ 0.75x – 1.25x, lời thoại chữ Hán, Pinyin và dịch Việt.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((sec) => {
          const payload = sec.contentPayload as {
            dialogueTitleVi?: string;
            lines?: Array<{ speaker: string; zh: string; pinyin: string; vi: string }>;
          };
          const lines = payload?.lines ?? [];
          if (lines.length === 0) return null;

          return (
            <Card key={sec.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {payload.dialogueTitleVi ?? sec.lesson.titleVi}
                  </CardTitle>
                  <Link href={`/lessons/${sec.lesson.slug}`}>
                    <Badge variant="outline">{sec.lesson.titleVi}</Badge>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ChineseAudioPlayer textZh={lines.map((l) => l.zh).join(" ")} />
                <div className="space-y-2">
                  {lines.map((line, i) => (
                    <div key={i} className="rounded-md border border-border bg-background p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {line.speaker}
                        </span>
                        <ChineseAudioPlayer textZh={line.zh} compact />
                      </div>
                      <div lang="zh-Hans" className="font-hanzi mt-1 text-lg">
                        {line.zh}
                      </div>
                      <div className="font-pinyin text-xs text-primary">{line.pinyin}</div>
                      <div className="text-xs text-muted-foreground">{line.vi}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
