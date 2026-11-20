import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { text: string; variant: "outline" | "default" | "success" | "warning" }> = {
  NOT_STARTED: { text: "Chưa học", variant: "outline" },
  IN_PROGRESS: { text: "Đang học", variant: "default" },
  COMPLETED: { text: "Hoàn thành", variant: "success" },
  NEEDS_REVIEW: { text: "Cần ôn lại", variant: "warning" },
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      learningLevel: { select: { titleVi: true } },
      modules: {
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            where: { status: "PUBLISHED" },
            orderBy: { sortOrder: "asc" },
            include: {
              prerequisites: {
                include: { prerequisiteLesson: { select: { titleVi: true, slug: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const progressList = await prisma.userLessonProgress.findMany({
    where: {
      userId: user.id,
      lesson: { module: { courseId: course.id } },
    },
  });
  const progMap = new Map(progressList.map((p) => [p.lessonId, p]));

  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-border pb-4">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại danh sách khóa học
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{course.learningLevel.titleVi}</Badge>
          <span className="text-xs text-muted-foreground">~{course.estimatedMinutes} phút</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">{course.titleVi}</h1>
        {course.titleZh ? (
          <p lang="zh-Hans" className="font-hanzi text-base text-primary">
            {course.titleZh}
          </p>
        ) : null}
        {course.summaryVi ? (
          <p className="text-sm text-muted-foreground">{course.summaryVi}</p>
        ) : null}
      </div>

      <div className="space-y-4">
        {course.modules.map((mod) => (
          <Card key={mod.id}>
            <CardHeader>
              <CardTitle className="text-base">{mod.titleVi}</CardTitle>
              {mod.titleZh ? (
                <CardDescription lang="zh-Hans" className="font-hanzi">
                  {mod.titleZh}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2.5">
              {mod.lessons.map((lesson) => {
                const prog = progMap.get(lesson.id);
                const st = STATUS_LABEL[prog?.status ?? "NOT_STARTED"];

                return (
                  <div
                    key={lesson.id}
                    className="flex flex-col justify-between gap-3 rounded-md border border-border bg-background p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {prog?.status === "COMPLETED" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : null}
                        <span className="text-sm font-semibold text-foreground">
                          {lesson.titleVi}
                        </span>
                        <Badge variant={st.variant}>{st.text}</Badge>
                      </div>
                      {lesson.titleZh ? (
                        <div lang="zh-Hans" className="font-hanzi text-sm text-primary">
                          {lesson.titleZh}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {lesson.estimatedMinutes} phút
                        </span>
                        {lesson.prerequisites.length > 0 ? (
                          <span>
                            Kiến thức nền khuyến nghị:{" "}
                            {lesson.prerequisites
                              .map((p) => p.prerequisiteLesson.titleVi)
                              .join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <Button size="sm" asChild>
                      <Link href={`/lessons/${lesson.slug}`}>
                        {prog?.status === "COMPLETED" ? "Ôn lại bài" : "Học bài"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
