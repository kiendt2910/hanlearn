import Link from "next/link";
import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartExamButton } from "@/modules/examinations/components/StartExamButton";

export const metadata: Metadata = {
  title: "Kiểm tra trình độ đầu vào",
};

export const dynamic = "force-dynamic";

export default async function PlacementTestPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [placementExam, history] = await Promise.all([
    prisma.examTemplate.findFirst({
      where: { examType: "PLACEMENT", status: "PUBLISHED" },
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { questions: true } } },
        },
      },
    }),
    prisma.examAttempt.findMany({
      where: {
        userId: user.id,
        examTemplate: { examType: "PLACEMENT" },
        result: { isNot: null },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: { result: true },
    }),
  ]);

  const totalQuestions =
    placementExam?.sections.reduce((acc, s) => acc + s._count.questions, 0) ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Kiểm tra đánh giá trình độ đầu vào</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dành cho học viên đã biết một phần tiếng Trung muốn vào đúng cấp độ phù hợp và mở quyền bỏ qua nội dung cơ bản đã nắm vững.
        </p>
      </div>

      {placementExam ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <Badge variant="default">Đề đánh giá gốc HanLearn</Badge>
            </div>
            <CardTitle className="mt-2">{placementExam.titleVi}</CardTitle>
            <CardDescription>{placementExam.descriptionVi}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 rounded-md border border-border bg-background p-3 text-center text-xs">
              <div>
                <div className="text-muted-foreground">Thời gian</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {Math.round(placementExam.durationSeconds / 60)} phút
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Số câu hỏi</div>
                <div className="mt-0.5 text-sm font-semibold">{totalQuestions} câu</div>
              </div>
              <div>
                <div className="text-muted-foreground">Phần thi</div>
                <div className="mt-0.5 text-sm font-semibold">{placementExam.sections.length} phần</div>
              </div>
            </div>

            <StartExamButton examTemplateId={placementExam.id} label="Bắt đầu kiểm tra đầu vào" />
          </CardContent>
        </Card>
      ) : null}

      {history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Các lần kiểm tra đầu vào trước đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((att) => (
              <Link
                key={att.id}
                href={`/exams/attempts/${att.id}/result`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs hover:bg-surface-muted"
              >
                <span>
                  {att.submittedAt?.toLocaleString("vi-VN")} — Chính xác {att.result?.accuracyPercent}%
                </span>
                <Badge variant="secondary">
                  {att.result?.totalScore}/{att.result?.maxScore} điểm
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
