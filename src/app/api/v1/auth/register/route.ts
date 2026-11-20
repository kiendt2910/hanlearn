import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { RoleCode } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { apiOk, apiError, handleApiError } from "@/lib/validation/api";
import { globalRateLimiter } from "@/lib/rate-limit/memory-rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const rate = globalRateLimiter.check(`auth:register:${ip}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 10,
    });

    if (!rate.allowed) {
      return apiError(
        "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.",
        429,
        "RATE_LIMITED"
      );
    }

    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });

    if (existing) {
      return apiError("Địa chỉ email này đã được đăng ký.", 409, "EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);

    const created = await prisma.$transaction(async (tx) => {
      const learnerRole = await tx.role.upsert({
        where: { code: RoleCode.LEARNER },
        update: {},
        create: {
          code: RoleCode.LEARNER,
          name: "Học viên",
          description: "Học viên nền tảng HanLearn",
        },
      });

      const defaultCurriculum = await tx.curriculumVersion.findFirst({
        where: { isDefault: true, status: "PUBLISHED" },
        select: { id: true },
      });

      const user = await tx.user.create({
        data: {
          email: parsed.email,
          passwordHash,
          isActive: true,
          profile: {
            create: {
              displayName: parsed.displayName,
              nativeLanguage: "vi",
              currentCurriculumVersionId: defaultCurriculum?.id ?? null,
              dailyGoalMinutes: 30,
            },
          },
          settings: {
            create: {
              theme: "system",
              uiLanguage: "vi",
              showPinyinByDefault: true,
              showTranslationDefault: true,
              audioPlaybackSpeed: 1.0,
            },
          },
          userRoles: {
            create: {
              roleId: learnerRole.id,
            },
          },
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          profile: { select: { displayName: true } },
        },
      });

      return user;
    });

    return apiOk(
      {
        id: created.id,
        email: created.email,
        displayName: created.profile?.displayName ?? parsed.displayName,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
