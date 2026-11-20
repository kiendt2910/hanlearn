import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessSystemAdmin } from "@/lib/permissions/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAiConfigForm } from "@/modules/administration/components/AdminSystemControls";

export const dynamic = "force-dynamic";

export default async function AdminAiConfigPage() {
  const actor = await getCurrentUser();
  if (!actor || !canAccessSystemAdmin(actor.roles)) redirect("/admin");

  const setting = await prisma.systemSetting.findUnique({
    where: { key: "ai.provider_config" },
  });
  const val = (setting?.value ?? {}) as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cấu hình Gia sư AI phía máy chủ</h1>
        <p className="text-sm text-muted-foreground">
          Độc lập nhà cung cấp (OpenAI-compatible / Google Gemini). Khóa API được lưu phía máy chủ và không bao giờ gửi xuống trình duyệt.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kết nối nhà cung cấp & Hạn mức sử dụng</CardTitle>
          <CardDescription>
            Nếu để trống API Key, hệ thống sẽ sử dụng bộ hỗ trợ ngữ pháp & kho từ vựng cục bộ và thông báo minh bạch cho học viên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminAiConfigForm
            initial={{
              provider: String(val.provider ?? process.env.AI_PROVIDER ?? "openai-compatible"),
              baseUrl: String(val.baseUrl ?? process.env.AI_API_BASE_URL ?? ""),
              model: String(val.model ?? process.env.AI_MODEL ?? ""),
              dailyUserLimit: Number(val.dailyUserLimit ?? process.env.AI_DAILY_USER_LIMIT ?? 30),
              hasApiKeyConfigured: Boolean(val.apiKey || process.env.AI_API_KEY),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
