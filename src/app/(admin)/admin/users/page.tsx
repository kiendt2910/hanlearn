import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessSystemAdmin } from "@/lib/permissions/rbac";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminUserRoleSelect } from "@/modules/administration/components/AdminSystemControls";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const actor = await getCurrentUser();
  if (!actor || !canAccessSystemAdmin(actor.roles)) redirect("/admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { displayName: true } },
      userRoles: { include: { role: { select: { code: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Quản lý Người dùng & Phân quyền ({users.length})</h1>
        <p className="text-sm text-muted-foreground">
          Chỉ Quản trị viên hệ thống (ADMIN) mới có quyền phân vai trò.
        </p>
      </div>

      <div className="space-y-2.5">
        {users.map((u) => {
          const primaryRole = u.userRoles[0]?.role.code ?? "LEARNER";
          return (
            <Card key={u.id}>
              <CardContent className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {u.profile?.displayName ?? u.email}
                    </span>
                    <Badge variant={u.isActive ? "success" : "destructive"}>
                      {u.isActive ? "Hoạt động" : "Đã khóa"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <AdminUserRoleSelect userId={u.id} currentRole={primaryRole} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
