import Link from "next/link";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StartExamButton } from "@/modules/examinations/components/StartExamButton";
import { CustomExamBuilder } from "@/modules/examinations/components/CustomExamBuilder";

export const metadata: Metadata = {
  title: "Phòng thi thử HSK",
};

export const dynamic = "force-dynamic";

export default async function ExamsCatalogPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [templates, history] = await Promise.all([
    prisma.examTemplate.findMany({
      where: { status: "PUBLISHED", examType: { not: "CUSTOM" } },
      orderBy: { createdAt: "asc" },
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { questions: true } } },
        },
      },
    }),
    prisma.examAttempt.findMany({
      where: { userId: user.id, result: { isNot: null } },
      orderBy: { submittedAt: "desc" },
      take: 10,
      include: {
        examTemplate: { select: { titleVi: true } },
        result: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Hệ thống Đề thi & Luyện thi HSK</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cấu hình thời gian, điểm số và tự động nộp bài được kiểm soát phía máy chủ. Đề luyện tập gốc được gắn nhãn minh bạch, phân biệt rõ với đề bản quyền chính thức.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl) => {
          const totalQuestions = tpl.sections.reduce(
            (sum, s) => sum + s._count.questions,
            0
          );
          return (
            <Card key={tpl.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={tpl.isOfficialLicensed ? "default" : "success"}>
                    {tpl.isOfficialLicensed ? "Đề bản quyền chính thức" : "Đề luyện tập gốc"}
                  </Badge>
                  <Badge variant="outline">{tpl.examType}</Badge>
                </div>
                <CardTitle className="mt-2 text-base">{tpl.titleVi}</CardTitle>
                <CardDescription>{tpl.descriptionVi}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.round(tpl.durationSeconds / 60)} phút
                  </span>
                  <span>{totalQuestions} câu hỏi</span>
                  <span>Điểm đạt: {tpl.passingScore}/{tpl.totalPoints}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StartExamButton examTemplateId={tpl.id} />
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/exams/${tpl.slug}`}>Chi tiết cấu trúc</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CustomExamBuilder />

      {/* Exam History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử làm bài thi của bạn ({history.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">Chưa có bài thi nào được nộp.</p>
          ) : (
            history.map((att) => (
              <Link
                key={att.id}
                href={`/exams/attempts/${att.id}/result`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs hover:bg-surface-muted"
              >
                <div>
                  <span className="font-medium text-foreground">{att.examTemplate.titleVi}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({att.submittedAt?.toLocaleString("vi-VN")})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {att.result?.totalScore}/{att.result?.maxScore} ({att.result?.accuracyPercent}%)
                  </span>
                  <Badge variant={att.result?.passed ? "success" : "warning"}>
                    {att.result?.passed ? "Đạt" : "Chưa đạt"}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
