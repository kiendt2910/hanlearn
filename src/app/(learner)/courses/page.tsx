import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Khóa học tiếng Trung",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [courses, progressList] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ learningLevel: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: {
        learningLevel: { select: { titleVi: true, cefrEquivalent: true } },
        modules: {
          where: { status: "PUBLISHED" },
          include: { _count: { select: { lessons: { where: { status: "PUBLISHED" } } } } },
        },
      },
    }),
    prisma.userCourseProgress.findMany({ where: { userId: user.id } }),
  ]);

  const progressMap = new Map(progressList.map((p) => [p.courseId, p]));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Danh mục Khóa học</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tất cả khóa học từ Nền tảng Pinyin, HSK 1–2 đến Tiếng Trung Thương mại.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => {
          const lessonCount = course.modules.reduce((acc, m) => acc + m._count.lessons, 0);
          const prog = progressMap.get(course.id);
          return (
            <Card key={course.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="default">{course.learningLevel.titleVi}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {lessonCount} bài học • ~{course.estimatedMinutes} phút
                  </span>
                </div>
                <CardTitle className="mt-2">{course.titleVi}</CardTitle>
                {course.titleZh ? (
                  <p lang="zh-Hans" className="font-hanzi text-sm text-primary">
                    {course.titleZh}
                  </p>
                ) : null}
                <CardDescription>{course.summaryVi}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Hoàn thành</span>
                    <span>{Math.round(prog?.progressPercent ?? 0)}%</span>
                  </div>
                  <Progress value={prog?.progressPercent ?? 0} />
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/courses/${course.slug}`}>
                    Vào khóa học
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
