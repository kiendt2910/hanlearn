import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Compass, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { CurriculumVersionSwitcher } from "@/modules/curriculum/components/CurriculumVersionSwitcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Lộ trình học tiếng Trung",
};

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, versions, courseProgressList] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.curriculumVersion.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { isDefault: "desc" },
    }),
    prisma.userCourseProgress.findMany({ where: { userId: user.id } }),
  ]);

  const activeVersion =
    versions.find((v) => v.id === profile?.currentCurriculumVersionId) ?? versions[0];

  const levels = activeVersion
    ? await prisma.learningLevel.findMany({
        where: { curriculumVersionId: activeVersion.id, status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" },
        include: {
          courses: {
            where: { status: "PUBLISHED" },
            orderBy: { sortOrder: "asc" },
            include: {
              modules: {
                where: { status: "PUBLISHED" },
                include: {
                  _count: { select: { lessons: { where: { status: "PUBLISHED" } } } },
                },
              },
            },
          },
          _count: { select: { vocabulary: true, grammarPoints: true } },
        },
      })
    : [];

  const progressByCourse = new Map(courseProgressList.map((p) => [p.courseId, p]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-xl font-bold text-foreground">Lộ trình học tiếng Trung chuẩn hóa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn khung giáo trình phù hợp (HSK 6 cấp truyền thống hoặc HSK 3.0) và theo dõi tiến độ từng cấp độ từ con số 0 đến chuyên nghiệp.
          </p>
        </div>
        <Button asChild>
          <Link href="/placement-test">
            <Compass className="h-4 w-4" />
            Làm bài kiểm tra đầu vào
          </Link>
        </Button>
      </div>

      {/* Version Switcher */}
      {activeVersion ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Phiên bản giáo trình đang chọn
          </div>
          <CurriculumVersionSwitcher
            versions={versions}
            activeVersionId={activeVersion.id}
          />
          {activeVersion.description ? (
            <p className="text-xs text-muted-foreground">{activeVersion.description}</p>
          ) : null}
        </div>
      ) : null}

      {/* Level Progression Ladder */}
      <div className="space-y-4">
        {levels.map((level) => {
          const isCurrent = profile?.currentLevelId === level.id;
          const objectives = Array.isArray(level.objectivesVi)
            ? (level.objectivesVi as string[])
            : [];

          return (
            <Card key={level.id} className={isCurrent ? "border-primary" : undefined}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Bậc {level.sortOrder}</Badge>
                    {level.cefrEquivalent ? (
                      <Badge variant="secondary">CEFR {level.cefrEquivalent}</Badge>
                    ) : null}
                    {isCurrent ? <Badge variant="default">Cấp độ hiện tại của bạn</Badge> : null}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {level._count.vocabulary} từ vựng • {level._count.grammarPoints} ngữ pháp
                  </span>
                </div>
                <CardTitle className="mt-2 flex flex-wrap items-baseline gap-2 text-base">
                  <span>{level.titleVi}</span>
                  {level.titleZh ? (
                    <span lang="zh-Hans" className="font-hanzi text-sm font-medium text-primary">
                      {level.titleZh}
                    </span>
                  ) : null}
                </CardTitle>
                {level.descriptionVi ? (
                  <CardDescription>{level.descriptionVi}</CardDescription>
                ) : null}
              </CardHeader>

              <CardContent className="space-y-4">
                {objectives.length > 0 ? (
                  <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                    {objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {level.courses.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {level.courses.map((course) => {
                      const totalLessons = course.modules.reduce(
                        (acc, m) => acc + m._count.lessons,
                        0
                      );
                      const cp = progressByCourse.get(course.id);
                      const pct = cp?.progressPercent ?? 0;

                      return (
                        <div
                          key={course.id}
                          className="flex flex-col justify-between gap-3 rounded-md border border-border bg-background p-4"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {course.titleVi}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {totalLessons} bài học
                              </span>
                            </div>
                            {course.summaryVi ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {course.summaryVi}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                              <span>Tiến độ khóa học</span>
                              <span>{Math.round(pct)}%</span>
                            </div>
                            <Progress value={pct} />
                            <Button size="sm" variant="outline" className="w-full" asChild>
                              <Link href={`/courses/${course.slug}`}>
                                <GraduationCap className="h-3.5 w-3.5" />
                                Xem giáo trình khóa học
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                    Khung cấp độ đã sẵn sàng trong hệ thống. Khóa học và bài giảng cho cấp độ này có thể được biên tập và xuất bản trực tiếp qua Admin CMS.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
