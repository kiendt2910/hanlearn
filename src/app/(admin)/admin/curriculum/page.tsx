import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentStatusSelect } from "@/modules/administration/components/ContentStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminCurriculumPage() {
  const versions = await prisma.curriculumVersion.findMany({
    orderBy: { isDefault: "desc" },
    include: {
      levels: {
        orderBy: { sortOrder: "asc" },
        include: {
          courses: {
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { modules: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Quản lý Giáo trình, Cấp độ & Khóa học</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý cấu trúc phân cấp đa phiên bản (HSK 2.0 & HSK 3.0).
        </p>
      </div>

      {versions.map((v) => (
        <Card key={v.id}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{v.name}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="default">{v.framework}</Badge>
                <Badge variant="outline">{v.code}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {v.levels.map((lvl) => (
              <div key={lvl.id} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>
                    {lvl.sortOrder}. {lvl.titleVi}
                  </span>
                  <Badge variant="secondary">{lvl.courses.length} khóa học</Badge>
                </div>
                {lvl.courses.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {lvl.courses.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-surface px-3 py-1.5 text-xs"
                      >
                        <span>
                          {c.titleVi} ({c._count.modules} chương)
                        </span>
                        <ContentStatusSelect
                          entityType="course"
                          entityId={c.id}
                          currentStatus={c.status}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
