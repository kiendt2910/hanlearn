import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, ClipboardCheck, Layers, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Tổng quan học tập",
};

export const dynamic = "force-dynamic";

const SKILL_LABELS: Record<string, string> = {
  LISTENING: "Nghe hiểu",
  SPEAKING: "Nói",
  READING: "Đọc hiểu",
  WRITING: "Viết",
  VOCABULARY: "Từ vựng",
  GRAMMAR: "Ngữ pháp",
  PRONUNCIATION: "Phát âm",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [
    profile,
    publishedLessons,
    lessonProgressList,
    dueFlashcardsCount,
    totalFlashcardsCount,
    skillStats,
    recentExamAttempts,
    featuredExam,
  ] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: {
        currentCurriculumVersion: { select: { name: true, code: true } },
        currentLevel: { select: { titleVi: true } },
      },
    }),
    prisma.lesson.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [
        { module: { course: { learningLevel: { sortOrder: "asc" } } } },
        { sortOrder: "asc" },
      ],
      take: 10,
      include: {
        module: {
          include: {
            course: {
              include: { learningLevel: { select: { titleVi: true } } },
            },
          },
        },
        _count: { select: { sections: true } },
      },
    }),
    prisma.userLessonProgress.findMany({
      where: { userId: user.id },
      orderBy: { lastAccessedAt: "desc" },
    }),
    prisma.flashcardState.count({
      where: {
        dueAt: { lte: new Date() },
        flashcard: { userId: user.id, deletedAt: null, isSuspended: false },
      },
    }),
    prisma.flashcard.count({
      where: { userId: user.id, deletedAt: null },
    }),
    prisma.userSkillStat.findMany({
      where: { userId: user.id },
      orderBy: { skillType: "asc" },
    }),
    prisma.examAttempt.findMany({
      where: { userId: user.id, result: { isNot: null } },
      orderBy: { submittedAt: "desc" },
      take: 3,
      include: {
        examTemplate: { select: { titleVi: true } },
        result: { select: { totalScore: true, maxScore: true, accuracyPercent: true, passed: true } },
      },
    }),
    prisma.examTemplate.findFirst({
      where: { status: "PUBLISHED", examType: "FULL_MOCK" },
      select: { slug: true, titleVi: true, durationSeconds: true },
    }),
  ]);

  const progressByLesson = new Map(lessonProgressList.map((p) => [p.lessonId, p]));
  const completedCount = lessonProgressList.filter((p) => p.status === "COMPLETED").length;

  const activeLesson =
    publishedLessons.find((l) => {
      const p = progressByLesson.get(l.id);
      return !p || p.status !== "COMPLETED";
    }) ?? publishedLessons[0];

  const activeProgress = activeLesson ? progressByLesson.get(activeLesson.id) : null;
  const activeCompletedSections = Array.isArray(activeProgress?.completedSections)
    ? activeProgress.completedSections.length
    : 0;
  const activeTotalSections = activeLesson?._count.sections ?? 8;
  const activePercent = Math.round((activeCompletedSections / Math.max(1, activeTotalSections)) * 100);

  return (
    <div className="space-y-6">
      {/* Greeting & Active Curriculum */}
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Xin chào, {profile?.displayName ?? user.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Giáo trình:{" "}
            <span className="font-medium text-foreground">
              {profile?.currentCurriculumVersion?.name ?? "Khung HSK Truyền thống (6 Cấp)"}
            </span>
            {profile?.currentLevel ? ` • Cấp độ: ${profile.currentLevel.titleVi}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Chuỗi học: {profile?.streakDays ?? 0} ngày</Badge>
          <Badge variant="default">Mục tiêu: {profile?.dailyGoalMinutes ?? 30} phút/ngày</Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/roadmap">Đổi lộ trình</Link>
          </Button>
        </div>
      </div>

      {/* Primary Action Row */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="default">Bài học đề xuất tiếp theo</Badge>
              <span className="text-xs text-muted-foreground">
                Hoàn thành: {completedCount}/{publishedLessons.length} bài
              </span>
            </div>
            <CardTitle className="mt-2 text-lg">
              {activeLesson ? activeLesson.titleVi : "Chưa có bài học"}
            </CardTitle>
            {activeLesson?.titleZh ? (
              <CardDescription lang="zh-Hans" className="font-hanzi text-base text-foreground/80">
                {activeLesson.titleZh}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tiến độ 8 mục bài học</span>
                <span>
                  {activeCompletedSections}/{activeTotalSections} mục ({activePercent}%)
                </span>
              </div>
              <Progress value={activePercent} />
            </div>

            <div className="flex flex-wrap gap-2">
              {activeLesson ? (
                <Button asChild>
                  <Link href={`/lessons/${activeLesson.slug}`}>
                    <BookOpen className="h-4 w-4" />
                    {activeCompletedSections > 0 ? "Tiếp tục học bài này" : "Bắt đầu học ngay"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" asChild>
                <Link href="/foundation">Nền tảng từ Con số 0</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/placement-test">Kiểm tra đầu vào</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:col-span-5">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Layers className="h-4 w-4 text-primary" />
                  Ôn tập Flashcards (FSRS)
                </CardTitle>
                <Badge variant={dueFlashcardsCount > 0 ? "warning" : "success"}>
                  {dueFlashcardsCount} thẻ đến hạn
                </Badge>
              </div>
              <CardDescription>
                Tổng cộng {totalFlashcardsCount} thẻ trong thư viện của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/flashcards/review">Ôn tập ngay</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/flashcards">Quản lý bộ thẻ</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Phòng thi thử HSK
              </CardTitle>
              <CardDescription>
                {featuredExam
                  ? `${featuredExam.titleVi} (${Math.round(featuredExam.durationSeconds / 60)} phút)`
                  : "Luyện đề thi theo kỹ năng và đề tổng hợp."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={featuredExam ? `/exams/${featuredExam.slug}` : "/exams"}>
                  Vào phòng thi
                </Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/ai-tutor">
                  <Sparkles className="h-3.5 w-3.5" />
                  Hỏi Gia sư AI
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Skills & Recent Exams */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hồ sơ năng lực theo kỹ năng</CardTitle>
            <CardDescription>Cập nhật tự động sau mỗi bài tập, bài viết và đề thi HSK.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {skillStats.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có dữ liệu kỹ năng. Hãy hoàn thành một bài tập trong bài học hoặc làm bài kiểm tra đầu vào.
              </p>
            ) : (
              skillStats.map((stat) => (
                <div key={stat.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {SKILL_LABELS[stat.skillType] ?? stat.skillType}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(stat.masteryScore)}% ({stat.correctCount}/{stat.attemptsCount})
                    </span>
                  </div>
                  <Progress value={stat.masteryScore} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lịch sử đề thi HSK gần đây</CardTitle>
            <CardDescription>Theo dõi điểm số và xem lại giải thích chi tiết.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {recentExamAttempts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Bạn chưa hoàn thành lượt thi nào.{" "}
                <Link href="/exams" className="font-medium text-primary hover:underline">
                  Thử đề HSK 1 ngay
                </Link>
                .
              </p>
            ) : (
              recentExamAttempts.map((att) => (
                <Link
                  key={att.id}
                  href={`/exams/attempts/${att.id}/result`}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs hover:bg-surface-muted"
                >
                  <span className="font-medium text-foreground">{att.examTemplate.titleVi}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {att.result?.totalScore}/{att.result?.maxScore}
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
