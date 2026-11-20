import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Thống kê & Phân tích học tập",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [
    profile,
    lessonProgress,
    skillStats,
    flashcardStates,
    reviewCount,
    examResults,
    writingCount,
    pronunciationCount,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.userLessonProgress.findMany({ where: { userId: user.id } }),
    prisma.userSkillStat.findMany({ where: { userId: user.id }, orderBy: { masteryScore: "asc" } }),
    prisma.flashcardState.findMany({
      where: { flashcard: { userId: user.id, deletedAt: null } },
      select: { state: true, stability: true },
    }),
    prisma.flashcardReview.count({ where: { userId: user.id } }),
    prisma.examAttempt.findMany({
      where: { userId: user.id, result: { isNot: null } },
      orderBy: { submittedAt: "desc" },
      take: 10,
      include: {
        examTemplate: { select: { titleVi: true } },
        result: true,
      },
    }),
    prisma.writingSubmission.count({ where: { userId: user.id } }),
    prisma.pronunciationAttempt.count({ where: { userId: user.id } }),
  ]);

  const completedLessons = lessonProgress.filter((l) => l.status === "COMPLETED").length;
  const totalStudyMinutes = Math.round(
    lessonProgress.reduce((acc, l) => acc + l.timeSpentSeconds, 0) / 60
  );

  const fsrsBuckets = {
    NEW: flashcardStates.filter((s) => s.state === "NEW").length,
    LEARNING: flashcardStates.filter((s) => s.state === "LEARNING" || s.state === "RELEARNING").length,
    REVIEW: flashcardStates.filter((s) => s.state === "REVIEW").length,
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Thống kê & Phân tích Học tập</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng hợp tiến độ bài học, trí nhớ dài hạn FSRS, kết quả thi thử HSK và điểm yếu cần cải thiện.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chuỗi ngày học liên tiếp</CardDescription>
            <CardTitle className="text-2xl">{profile?.streakDays ?? 0} ngày</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Kỷ lục: {profile?.longestStreakDays ?? 0} ngày
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bài học hoàn thành</CardDescription>
            <CardTitle className="text-2xl">{completedLessons}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Thời lượng ghi nhận: {totalStudyMinutes} phút
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng lượt ôn Flashcards</CardDescription>
            <CardTitle className="text-2xl">{reviewCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Mới: {fsrsBuckets.NEW} • Đang học: {fsrsBuckets.LEARNING} • Ghi nhớ: {fsrsBuckets.REVIEW}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Thực hành Viết & Phát âm</CardDescription>
            <CardTitle className="text-2xl">
              {writingCount} / {pronunciationCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Bài viết đã nộp / Lượt luyện phát âm
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Độ thành thạo từng kỹ năng</CardTitle>
            <CardDescription>Sắp xếp từ kỹ năng cần cải thiện nhất lên cao nhất.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {skillStats.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có dữ liệu kỹ năng. Hãy làm bài tập hoặc đề thi HSK.
              </p>
            ) : (
              skillStats.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{s.skillType}</span>
                    <span>
                      {Math.round(s.masteryScore)}% ({s.correctCount}/{s.attemptsCount})
                    </span>
                  </div>
                  <Progress value={s.masteryScore} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lịch sử điểm thi HSK ({examResults.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {examResults.length === 0 ? (
              <p className="text-xs text-muted-foreground">Chưa có kết quả thi HSK.</p>
            ) : (
              examResults.map((att) => (
                <Link
                  key={att.id}
                  href={`/exams/attempts/${att.id}/result`}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs hover:bg-surface-muted"
                >
                  <span className="truncate font-medium">{att.examTemplate.titleVi}</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {att.result?.totalScore}/{att.result?.maxScore} ({att.result?.accuracyPercent}%)
                    </span>
                    <Badge variant={att.result?.passed ? "success" : "warning"}>
                      {att.result?.passed ? "Đạt" : "Cần ôn"}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
