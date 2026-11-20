import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentStatusSelect } from "@/modules/administration/components/ContentStatusSelect";
import { AdminCreateVocabForm } from "@/modules/administration/components/AdminCreateVocabForm";

export const dynamic = "force-dynamic";

export default async function AdminVocabularyPage() {
  const [levels, vocabList, grammarList] = await Promise.all([
    prisma.learningLevel.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, titleVi: true } }),
    prisma.vocabulary.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.grammarPoint.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Quản lý Từ vựng & Ngữ pháp</h1>
        <p className="text-sm text-muted-foreground">
          Thêm mới và kiểm duyệt trạng thái xuất bản kho ngôn ngữ HanLearn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thêm nhanh mục Từ vựng</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminCreateVocabForm levels={levels} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kho Từ vựng ({vocabList.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {vocabList.map((v) => (
            <div
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs"
            >
              <div>
                <span lang="zh-Hans" className="font-hanzi text-base font-bold">
                  {v.simplified}
                </span>{" "}
                <span className="font-pinyin text-primary">{v.pinyin}</span> —{" "}
                <span>{v.primaryMeaningVi}</span>
              </div>
              <ContentStatusSelect
                entityType="vocabulary"
                entityId={v.id}
                currentStatus={v.status}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Điểm Ngữ pháp ({grammarList.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {grammarList.map((g) => (
            <div
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs"
            >
              <div>
                <Badge variant="outline" className="mr-2">{g.code}</Badge>
                <span className="font-semibold">{g.titleVi}</span>{" "}
                <span lang="zh-Hans" className="font-hanzi text-primary">{g.patternZh}</span>
              </div>
              <ContentStatusSelect
                entityType="grammar"
                entityId={g.id}
                currentStatus={g.status}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
