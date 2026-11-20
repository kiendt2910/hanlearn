import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessSystemAdmin } from "@/lib/permissions/rbac";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Quản trị CMS",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isSystemAdmin = canAccessSystemAdmin(user.roles);

  const [usersCount, versionsCount, lessonsCount, vocabCount] = await Promise.all([
    prisma.user.count(),
    prisma.curriculumVersion.count(),
    prisma.lesson.count(),
    prisma.vocabulary.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bảng điều khiển Quản trị CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Khu vực quản trị bảo vệ theo phân quyền (RBAC). Biên tập viên chỉ thao tác nội dung, không có quyền cấu hình hệ thống.
          </p>
        </div>
        <Badge variant={isSystemAdmin ? "default" : "secondary"}>
          {isSystemAdmin ? "Toàn quyền Quản trị viên (ADMIN)" : "Quyền Biên tập nội dung (CONTENT_EDITOR)"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Phiên bản giáo trình</CardDescription>
            <CardTitle className="text-2xl">{versionsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bài học trong CMS</CardDescription>
            <CardTitle className="text-2xl">{lessonsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mục từ vựng</CardDescription>
            <CardTitle className="text-2xl">{vocabCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng người dùng</CardDescription>
            <CardTitle className="text-2xl">{isSystemAdmin ? usersCount : "Ẩn (Editor)"}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
