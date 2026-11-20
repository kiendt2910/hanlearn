import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { computeFoundationReadiness } from "@/modules/foundation/adaptive.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StartExamButton } from "@/modules/examinations/components/StartExamButton";

export const metadata: Metadata = {
  title: "Nền tảng Tiếng Trung từ Con số 0 (Stages 0–7)",
};

export const dynamic = "force-dynamic";

export default async function FoundationHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [course, readiness, radicals, progressList, finalExam] = await Promise.all([
    prisma.course.findUnique({
      where: { slug: "chinese-foundations-starter" },
      include: {
        modules: {
          where: { status: "PUBLISHED" },
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: {
              where: { status: "PUBLISHED" },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    }),
    computeFoundationReadiness(user.id),
    prisma.radicalComponent.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.userLessonProgress.findMany({ where: { userId: user.id } }),
    prisma.examTemplate.findUnique({
      where: { slug: "foundation-final-assessment" },
      select: { id: true, titleVi: true, durationSeconds: true, totalPoints: true },
    }),
  ]);

  const progressMap = new Map(progressList.map((p) => [p.lessonId, p.status]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-end">
        <div>
          <Badge variant="default">Zero-to-Chinese Foundation • Stages 0 → 7</Badge>
          <h1 className="mt-2 text-xl font-bold text-foreground">
            Hệ thống Nền tảng Tiếng Trung từ Con số 0 cho Người Việt
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dạy từng khái niệm một — không giả định bạn đã biết Pinyin, thanh điệu hay chữ Hán. Trực quan, chậm rãi, kiểm tra đa kỹ năng trước khi sang HSK 1.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/lessons/foundation-s0-what-is-chinese">
              Bắt đầu từ Bài 0.1
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 6-Pillar Readiness Checker for HSK 1 */}
      <Card className={readiness.readyForHsk1 ? "border-emerald-500" : undefined}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Đánh giá 6 Trụ cột Sẵn sàng lên HSK 1
            </CardTitle>
            <Badge variant={readiness.readyForHsk1 ? "success" : "warning"}>
              {readiness.readyForHsk1
                ? "Đủ điều kiện chuyển tiếp HSK 1"
                : "Đang xây dựng nền tảng (Chưa mở khuyến nghị HSK 1)"}
            </Badge>
          </div>
          <CardDescription>
            Hệ thống đánh giá đồng thời cả 6 trụ cột (không bao giờ chỉ dựa vào thuộc từ vựng): Hoàn thành {readiness.completedFoundationLessons}/{readiness.totalFoundationLessons} bài nền tảng • Trung bình khái niệm: {readiness.overallMasteryPercent}%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {readiness.pillarBreakdown.map((p) => (
              <div key={p.pillar} className="space-y-1.5 rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{p.labelVi}</span>
                  <span className={p.passedThreshold ? "font-semibold text-emerald-600" : "text-muted-foreground"}>
                    {p.masteryPercent}%
                  </span>
                </div>
                <Progress value={p.masteryPercent} />
              </div>
            ))}
          </div>

          {finalExam ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-muted/40 p-3.5 text-xs">
              <div>
                <div className="font-semibold text-foreground">{finalExam.titleVi}</div>
                <div className="text-muted-foreground">
                  {Math.round(finalExam.durationSeconds / 60)} phút • {finalExam.totalPoints} điểm • Yêu cầu ≥ 80% tổng và ≥ 70% mỗi trụ cột.
                </div>
              </div>
              <StartExamButton examTemplateId={finalExam.id} label="Làm Đánh giá Chặng 7" />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Complete Stages 0 – 6 Curriculum Tree */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Lộ trình từng Chặng (Stages 0 – 6)
        </h2>
        {(course?.modules ?? []).map((mod) => (
          <Card key={mod.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-wrap items-baseline gap-2 text-base">
                <span>{mod.titleVi}</span>
                {mod.titleZh ? (
                  <span lang="zh-Hans" className="font-hanzi text-sm text-primary">
                    {mod.titleZh}
                  </span>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mod.lessons.map((lesson) => {
                const st = progressMap.get(lesson.id) ?? "NOT_STARTED";
                return (
                  <div
                    key={lesson.id}
                    className="flex flex-col justify-between gap-2 rounded-md border border-border bg-background p-3 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {st === "COMPLETED" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : null}
                        <span className="text-sm font-semibold text-foreground">
                          {lesson.titleVi}
                        </span>
                        <Badge variant={st === "COMPLETED" ? "success" : st === "IN_PROGRESS" ? "default" : "outline"}>
                          {st === "COMPLETED" ? "Hoàn thành" : st === "IN_PROGRESS" ? "Đang học" : "Chưa học"}
                        </Badge>
                      </div>
                      {lesson.subtitleVi ? (
                        <p className="text-xs text-muted-foreground">{lesson.subtitleVi}</p>
                      ) : null}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/lessons/${lesson.slug}`}>
                        <GraduationCap className="h-3.5 w-3.5" />
                        Vào học
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 18 Common Radicals & Components Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Bảng tra cứu 18 Bộ thủ & Thành phần cốt lõi ({radicals.length} bộ)
          </CardTitle>
          <CardDescription>
            Học hình dạng độc lập, biến thể khi ghép, vị trí xuất hiện và ví dụ chữ Hán quen thuộc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {radicals.map((r) => {
              const variants = Array.isArray(r.variants) ? (r.variants as string[]) : [];
              const examples = Array.isArray(r.exampleCharacters)
                ? (r.exampleCharacters as Array<{ hanzi: string; pinyin: string; meaningVi: string }>)
                : [];
              return (
                <div key={r.id} className="space-y-1.5 rounded-md border border-border bg-background p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span lang="zh-Hans" className="font-hanzi text-2xl font-bold text-primary">
                        {r.symbol}
                      </span>
                      {variants.length > 0 ? (
                        <span lang="zh-Hans" className="font-hanzi text-base text-muted-foreground">
                          / {variants.join(", ")}
                        </span>
                      ) : null}
                      <span className="font-pinyin text-xs text-muted-foreground">{r.pinyin}</span>
                    </div>
                    <Badge variant="outline">{r.categoryVi}</Badge>
                  </div>
                  <div className="font-semibold text-foreground">
                    {r.nameVi} — {r.meaningVi}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Vị trí: {r.commonPositionVi}. {r.recognitionTipVi}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {examples.map((ex) => (
                      <Badge key={ex.hanzi} variant="secondary" className="text-[11px]">
                        <span className="font-hanzi mr-1 text-sm">{ex.hanzi}</span>
                        ({ex.meaningVi})
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
