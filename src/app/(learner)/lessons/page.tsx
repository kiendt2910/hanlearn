import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProvenanceBadge } from "@/components/feedback/StateViews";

export const metadata: Metadata = {
  title: "Danh sách bài học",
};

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; variant: "outline" | "default" | "success" | "warning" }> = {
  NOT_STARTED: { label: "Chưa học", variant: "outline" },
  IN_PROGRESS: { label: "Đang học", variant: "default" },
  COMPLETED: { label: "Hoàn thành", variant: "success" },
  NEEDS_REVIEW: { label: "Cần ôn tập", variant: "warning" },
};

export default async function LessonsIndexPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [lessons, progressList] = await Promise.all([
    prisma.lesson.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [
        { module: { course: { learningLevel: { sortOrder: "asc" } } } },
        { sortOrder: "asc" },
      ],
      include: {
        module: {
          include: {
            course: { include: { learningLevel: { select: { titleVi: true } } } },
          },
        },
        _count: { select: { lessonVocabulary: true, lessonGrammar: true, exercises: true } },
      },
    }),
    prisma.userLessonProgress.findMany({ where: { userId: user.id } }),
  ]);

  const progMap = new Map(progressList.map((p) => [p.lessonId, p]));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Tất cả bài học 8 phần</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mỗi bài học bao gồm đầy đủ: Mục tiêu, Từ vựng, Ngữ pháp, Nghe, Nói, Đọc, Viết nét chữ và Kiểm tra cuối bài.
        </p>
      </div>

      <div className="grid gap-3">
        {lessons.map((lesson) => {
          const prog = progMap.get(lesson.id);
          const statusMeta = STATUS_BADGE[prog?.status ?? "NOT_STARTED"];

          return (
            <Card key={lesson.id}>
              <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {lesson.module.course.learningLevel.titleVi}
                    </Badge>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                    <ProvenanceBadge origin={lesson.origin} />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">{lesson.titleVi}</h2>
                  {lesson.titleZh ? (
                    <p lang="zh-Hans" className="font-hanzi text-sm text-primary">
                      {lesson.titleZh}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.estimatedMinutes} phút
                    </span>
                    <span>{lesson._count.lessonVocabulary} từ vựng</span>
                    <span>{lesson._count.lessonGrammar} điểm ngữ pháp</span>
                    <span>{lesson._count.exercises} bài kiểm tra</span>
                  </div>
                </div>

                <Button asChild>
                  <Link href={`/lessons/${lesson.slug}`}>
                    Vào học
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
