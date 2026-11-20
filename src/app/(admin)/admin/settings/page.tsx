import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessSystemAdmin } from "@/lib/permissions/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const actor = await getCurrentUser();
  if (!actor || !canAccessSystemAdmin(actor.roles)) redirect("/admin");

  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cài đặt Hệ thống</h1>
        <p className="text-sm text-muted-foreground">
          Các thiết lập cấu hình lõi của nền tảng HanLearn. Mục bảo mật không hiển thị giá trị thô.
        </p>
      </div>

      <div className="space-y-2.5">
        {settings.map((s) => (
          <Card key={s.key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm">{s.key}</CardTitle>
                <Badge variant={s.isSecret ? "warning" : "outline"}>
                  {s.isSecret ? "Bảo mật (Secret)" : "Công khai nội bộ"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {s.description ? <p className="mb-1">{s.description}</p> : null}
              <pre className="overflow-x-auto rounded bg-background p-2 font-mono text-[11px] text-foreground">
                {s.isSecret ? "[REDACTED — Chỉ chỉnh sửa tại mục Cấu hình AI]" : JSON.stringify(s.value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
