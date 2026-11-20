import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatAnswerKeyHuman } from "@/lib/utils/format-answer";

export const dynamic = "force-dynamic";

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { attemptId } = await params;

  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId: user.id },
    include: {
      result: true,
      examTemplate: {
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: {
              questions: {
                orderBy: { sortOrder: "asc" },
                include: {
                  question: {
                    include: {
                      answers: true,
                      explanations: true,
                      options: { orderBy: { sortOrder: "asc" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt || !attempt.result) notFound();

  const res = attempt.result;
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const skillBreakdown = (res.skillBreakdown ?? {}) as Record<
    string,
    { score: number; max: number; correct: number; total: number; accuracy: number }
  >;
  const recommendations = Array.isArray(res.recommendedRevisionVi)
    ? (res.recommendedRevisionVi as string[])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <Link
            href="/exams"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại kho đề thi HSK
          </Link>
          <h1 className="mt-1 text-xl font-bold text-foreground">
            Kết quả: {attempt.examTemplate.titleVi}
          </h1>
        </div>
        <Badge variant={res.passed ? "success" : "warning"} className="text-sm">
          {res.passed ? "Đạt yêu cầu" : "Cần ôn tập thêm"}
        </Badge>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng điểm</CardDescription>
            <CardTitle className="text-2xl">
              {res.totalScore}/{res.maxScore}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Độ chính xác</CardDescription>
            <CardTitle className="text-2xl">{res.accuracyPercent}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trả lời đúng</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{res.correctCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trả lời sai / Bỏ trống</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {res.incorrectCount} / {res.unansweredCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Thời gian làm bài</CardDescription>
            <CardTitle className="text-2xl">
              {Math.floor(attempt.timeSpentSeconds / 60)}p {attempt.timeSpentSeconds % 60}s
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Skill Breakdown & Recommendations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phân tích theo kỹ năng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(skillBreakdown).map(([skill, stat]) => (
              <div key={skill} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{skill}</span>
                  <span>
                    {stat.correct}/{stat.total} câu ({stat.accuracy}%)
                  </span>
                </div>
                <Progress value={stat.accuracy} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đề xuất ôn tập</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            {recommendations.map((rec, i) => (
              <p key={i} className="text-xs leading-relaxed">
                • {rec}
              </p>
            ))}
            <div className="flex gap-2 pt-2">
              <Button size="sm" asChild>
                <Link href="/flashcards/review">Ôn Flashcard câu sai</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/roadmap">Về Lộ trình học</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Answer Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Giải thích chi tiết từng câu hỏi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {attempt.examTemplate.sections.flatMap((sec) =>
            sec.questions.map((sq, idx) => {
              const q = sq.question;
              const userAns = answerMap.get(q.id);
              const correct = Boolean(userAns?.isCorrect);
              return (
                <div
                  key={q.id}
                  className="space-y-1.5 rounded-md border border-border bg-background p-4 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                      Câu {idx + 1} ({sec.titleVi})
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        correct ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {correct ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Đúng (+{userAns?.pointsAwarded ?? 0})
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" /> Sai / Chưa trả lời
                        </>
                      )}
                    </span>
                  </div>
                  {q.promptVi ? <p className="text-foreground">{q.promptVi}</p> : null}
                  {q.promptZh ? (
                    <p lang="zh-Hans" className="font-hanzi text-base text-primary">
                      {q.promptZh}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    <strong>Đáp án chuẩn:</strong>{" "}
                    <span lang="zh-Hans" className="font-hanzi text-sm text-foreground">
                      {formatAnswerKeyHuman(q.answers[0]?.acceptedPayload)}
                    </span>
                  </p>
                  {q.explanations[0]?.explanationVi ? (
                    <p className="rounded bg-surface-muted px-3 py-2 text-xs text-foreground">
                      <strong>Giải thích:</strong> {q.explanations[0].explanationVi}
                    </p>
                  ) : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
