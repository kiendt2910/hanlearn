import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessSystemAdmin } from "@/lib/permissions/rbac";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const actor = await getCurrentUser();
  if (!actor || !canAccessSystemAdmin(actor.roles)) redirect("/admin");

  const logs = await prisma.contentAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Nhật ký Kiểm tra Quản trị (Audit Logs)</h1>
        <p className="text-sm text-muted-foreground">
          Ghi nhận tự động mọi thao tác tạo, sửa, xuất bản, lưu trữ nội dung và thay đổi phân quyền.
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Chưa có bản ghi thao tác nào. Nhật ký sẽ tự động xuất hiện khi Biên tập viên hoặc Quản trị viên thay đổi dữ liệu.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{log.action}</Badge>
                  <span className="font-semibold">{log.entityType}</span>
                  <span className="font-mono text-muted-foreground">{log.entityId.slice(0, 8)}</span>
                  <span>bởi {log.actor?.email ?? "system"}</span>
                </div>
                <span className="text-muted-foreground">
                  {log.createdAt.toLocaleString("vi-VN")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
