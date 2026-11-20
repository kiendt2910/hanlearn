import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";

const updateSettingsSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  dailyGoalMinutes: z.number().int().min(5).max(360).optional(),
  currentCurriculumVersionId: z.string().uuid().optional(),
  showPinyinByDefault: z.boolean().optional(),
  showTranslationDefault: z.boolean().optional(),
  toneColoringEnabled: z.boolean().optional(),
  audioPlaybackSpeed: z.number().min(0.5).max(2.0).optional(),
  dailyFlashcardLimit: z.number().int().min(5).max(300).optional(),
  autoGenerateFlashcards: z.boolean().optional(),
  offlineAutoSync: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const [profile, settings] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: user.id } }),
      prisma.userSetting.findUnique({ where: { userId: user.id } }),
    ]);
    return apiOk({ profile, settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = updateSettingsSchema.parse(await request.json());

    const [profile, settings] = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.userProfile.upsert({
        where: { userId: user.id },
        update: {
          ...(body.displayName !== undefined ? { displayName: body.displayName } : {}),
          ...(body.dailyGoalMinutes !== undefined
            ? { dailyGoalMinutes: body.dailyGoalMinutes }
            : {}),
          ...(body.currentCurriculumVersionId !== undefined
            ? { currentCurriculumVersionId: body.currentCurriculumVersionId }
            : {}),
        },
        create: {
          userId: user.id,
          displayName: body.displayName ?? user.name,
          dailyGoalMinutes: body.dailyGoalMinutes ?? 30,
          currentCurriculumVersionId: body.currentCurriculumVersionId ?? null,
        },
      });

      const updatedSettings = await tx.userSetting.upsert({
        where: { userId: user.id },
        update: {
          ...(body.showPinyinByDefault !== undefined
            ? { showPinyinByDefault: body.showPinyinByDefault }
            : {}),
          ...(body.showTranslationDefault !== undefined
            ? { showTranslationDefault: body.showTranslationDefault }
            : {}),
          ...(body.toneColoringEnabled !== undefined
            ? { toneColoringEnabled: body.toneColoringEnabled }
            : {}),
          ...(body.audioPlaybackSpeed !== undefined
            ? { audioPlaybackSpeed: body.audioPlaybackSpeed }
            : {}),
          ...(body.dailyFlashcardLimit !== undefined
            ? { dailyFlashcardLimit: body.dailyFlashcardLimit }
            : {}),
          ...(body.autoGenerateFlashcards !== undefined
            ? { autoGenerateFlashcards: body.autoGenerateFlashcards }
            : {}),
          ...(body.offlineAutoSync !== undefined
            ? { offlineAutoSync: body.offlineAutoSync }
            : {}),
        },
        create: {
          userId: user.id,
        },
      });

      return [updatedProfile, updatedSettings];
    });

    return apiOk({ profile, settings });
  } catch (error) {
    return handleApiError(error);
  }
}
