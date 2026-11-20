import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";

export const metadata: Metadata = {
  title: "Luyện Đọc hiểu tiếng Trung",
};

export const dynamic = "force-dynamic";

export default async function ReadingPracticePage() {
  const sections = await prisma.lessonSection.findMany({
    where: { sectionType: "READING", lesson: { status: "PUBLISHED" } },
    include: { lesson: { select: { slug: true, titleVi: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Luyện Đọc hiểu theo cấp độ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Đọc hiểu đoạn văn ngắn phân cấp kèm phiên âm Pinyin, đánh dấu từ khóa và bản dịch tiếng Việt đối chiếu.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((sec) => {
          const payload = sec.contentPayload as {
            titleVi?: string;
            passageZh?: string;
            passagePinyin?: string;
            translationVi?: string;
            highlightedWords?: string[];
          };
          if (!payload?.passageZh) return null;

          return (
            <Card key={sec.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {payload.titleVi ?? sec.lesson.titleVi}
                  </CardTitle>
                  <Link href={`/lessons/${sec.lesson.slug}`}>
                    <Badge variant="outline">Mở bài học</Badge>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ChineseAudioPlayer textZh={payload.passageZh} />
                <div
                  lang="zh-Hans"
                  className="font-hanzi rounded-md border border-border bg-background p-4 text-xl leading-loose text-foreground"
                >
                  {payload.passageZh}
                </div>
                {payload.passagePinyin ? (
                  <p className="font-pinyin text-sm text-primary">{payload.passagePinyin}</p>
                ) : null}
                {payload.translationVi ? (
                  <p className="text-sm text-muted-foreground">{payload.translationVi}</p>
                ) : null}
                {payload.highlightedWords?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {payload.highlightedWords.map((w) => (
                      <Badge key={w} variant="default" className="font-hanzi">
                        {w}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
