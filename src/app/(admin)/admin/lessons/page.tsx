import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentStatusSelect } from "@/modules/administration/components/ContentStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ module: { course: { learningLevel: { sortOrder: "asc" } } } }, { sortOrder: "asc" }],
    include: {
      module: { include: { course: { select: { titleVi: true } } } },
      _count: { select: { sections: true, lessonVocabulary: true, exercises: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Quản lý Bài học ({lessons.length})</h1>
        <p className="text-sm text-muted-foreground">
          Chuyển trạng thái Nháp / Xuất bản / Lưu trữ (có ghi nhật ký kiểm tra).
        </p>
      </div>

      <div className="space-y-2.5">
        {lessons.map((l) => (
          <Card key={l.id}>
            <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/lessons/${l.slug}`} className="text-sm font-semibold hover:underline">
                    {l.titleVi}
                  </Link>
                  <Badge variant="outline">{l.origin}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {l.module.course.titleVi} • {l._count.sections} mục • {l._count.lessonVocabulary} từ vựng • {l._count.exercises} bài kiểm tra
                </p>
              </div>
              <ContentStatusSelect
                entityType="lesson"
                entityId={l.id}
                currentStatus={l.status}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
