import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUserPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { logAdminAudit } from "@/modules/administration/audit.service";

const aiConfigSchema = z.object({
  provider: z.enum(["openai-compatible", "gemini"]),
  baseUrl: z.string().trim().max(300).optional(),
  model: z.string().trim().max(120),
  apiKey: z.string().trim().max(300).optional(),
  dailyUserLimit: z.number().int().min(1).max(500),
});

export async function GET() {
  try {
    await requireUserPermission(PERMISSIONS.ADMIN_AI_CONFIG);
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "ai.provider_config" },
    });
    const val = (setting?.value ?? {}) as Record<string, unknown>;
    return apiOk({
      provider: String(val.provider ?? process.env.AI_PROVIDER ?? "openai-compatible"),
      baseUrl: String(val.baseUrl ?? process.env.AI_API_BASE_URL ?? ""),
      model: String(val.model ?? process.env.AI_MODEL ?? ""),
      dailyUserLimit: Number(val.dailyUserLimit ?? process.env.AI_DAILY_USER_LIMIT ?? 30),
      hasApiKeyConfigured: Boolean(val.apiKey || process.env.AI_API_KEY),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireUserPermission(PERMISSIONS.ADMIN_AI_CONFIG);
    const body = aiConfigSchema.parse(await request.json());

    const existing = await prisma.systemSetting.findUnique({
      where: { key: "ai.provider_config" },
    });
    const prev = (existing?.value ?? {}) as Record<string, unknown>;

    const nextValue = {
      provider: body.provider,
      baseUrl: body.baseUrl ?? "",
      model: body.model,
      dailyUserLimit: body.dailyUserLimit,
      apiKey: body.apiKey && body.apiKey.length > 0 ? body.apiKey : (prev.apiKey ?? ""),
    };

    await prisma.systemSetting.upsert({
      where: { key: "ai.provider_config" },
      update: {
        value: nextValue as never,
        isSecret: true,
        updatedById: actor.id,
      },
      create: {
        key: "ai.provider_config",
        value: nextValue as never,
        isSecret: true,
        description: "Cấu hình nhà cung cấp AI phía máy chủ",
        updatedById: actor.id,
      },
    });

    await logAdminAudit({
      actorId: actor.id,
      action: "CONFIG_UPDATE",
      entityType: "system_setting",
      entityId: "ai.provider_config",
      afterData: {
        provider: body.provider,
        model: body.model,
        dailyUserLimit: body.dailyUserLimit,
        apiKeyUpdated: Boolean(body.apiKey),
      },
    });

    return apiOk({
      provider: nextValue.provider,
      baseUrl: nextValue.baseUrl,
      model: nextValue.model,
      dailyUserLimit: nextValue.dailyUserLimit,
      hasApiKeyConfigured: Boolean(nextValue.apiKey),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
