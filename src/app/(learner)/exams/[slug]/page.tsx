import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartExamButton } from "@/modules/examinations/components/StartExamButton";

export const dynamic = "force-dynamic";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tpl = await prisma.examTemplate.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  if (!tpl) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/exams"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại kho đề thi HSK
        </Link>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={tpl.isOfficialLicensed ? "default" : "success"}>
            {tpl.isOfficialLicensed ? "Đề thi bản quyền chính thức" : "Đề luyện tập gốc HanLearn"}
          </Badge>
          <Badge variant="outline">{Math.round(tpl.durationSeconds / 60)} phút</Badge>
        </div>
        <h1 className="mt-2 text-xl font-bold text-foreground">{tpl.titleVi}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{tpl.descriptionVi}</p>
        {tpl.licenseAttribution ? (
          <p className="mt-2 text-xs text-muted-foreground">{tpl.licenseAttribution}</p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cấu trúc các phần thi</CardTitle>
          <CardDescription>
            Điểm tối đa: {tpl.totalPoints} • Điểm đạt: {tpl.passingScore} • Đáp án chỉ hiển thị sau khi nộp bài.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tpl.sections.map((sec) => (
            <div
              key={sec.id}
              className="rounded-md border border-border bg-background p-3 text-sm"
            >
              <div className="flex items-center justify-between font-medium">
                <span>{sec.titleVi}</span>
                <span className="text-xs text-muted-foreground">
                  {sec._count.questions} câu • {sec.sectionPoints} điểm
                </span>
              </div>
              {sec.instructionsVi ? (
                <p className="mt-1 text-xs text-muted-foreground">{sec.instructionsVi}</p>
              ) : null}
            </div>
          ))}

          <div className="pt-2">
            <StartExamButton examTemplateId={tpl.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
