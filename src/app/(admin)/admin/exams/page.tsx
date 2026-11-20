import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentStatusSelect } from "@/modules/administration/components/ContentStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminExamsPage() {
  const exams = await prisma.examTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { sections: true, attempts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Quản lý Mẫu Đề thi HSK ({exams.length})</h1>
        <p className="text-sm text-muted-foreground">
          Cấu hình thời lượng, quy tắc chấm điểm và phân tách minh bạch Đề luyện tập gốc với Đề bản quyền chính thức.
        </p>
      </div>

      <div className="space-y-2.5">
        {exams.map((ex) => (
          <Card key={ex.id}>
            <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{ex.titleVi}</span>
                  <Badge variant={ex.isOfficialLicensed ? "default" : "success"}>
                    {ex.isOfficialLicensed ? "Bản quyền chính thức" : "Đề luyện tập gốc"}
                  </Badge>
                  <Badge variant="outline">{ex.examType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(ex.durationSeconds / 60)} phút • {ex.totalPoints} điểm (đạt {ex.passingScore}) • {ex._count.sections} phần • {ex._count.attempts} lượt thi
                </p>
              </div>
              <ContentStatusSelect
                entityType="exam"
                entityId={ex.id}
                currentStatus={ex.status}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
