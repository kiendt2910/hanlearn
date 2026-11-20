import { NextRequest } from "next/server";
import { ContentOrigin, ContentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUserPermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions/rbac";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { logAdminAudit } from "@/modules/administration/audit.service";

const createVocabSchema = z.object({
  simplified: z.string().trim().min(1),
  traditional: z.string().trim().optional(),
  pinyin: z.string().trim().min(1),
  partOfSpeech: z.string().trim().optional(),
  primaryMeaningVi: z.string().trim().min(1),
  primaryMeaningEn: z.string().trim().optional(),
  commonMistakesVi: z.string().trim().optional(),
  learningLevelId: z.string().uuid().optional(),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  origin: z.nativeEnum(ContentOrigin).default(ContentOrigin.VERIFIED_ORIGINAL),
});

export async function POST(request: NextRequest) {
  try {
    const actor = await requireUserPermission(PERMISSIONS.CMS_CONTENT_WRITE);
    const body = createVocabSchema.parse(await request.json());

    const vocab = await prisma.vocabulary.upsert({
      where: {
        simplified_pinyin: {
          simplified: body.simplified,
          pinyin: body.pinyin,
        },
      },
      update: {
        traditional: body.traditional ?? null,
        partOfSpeech: body.partOfSpeech ?? null,
        primaryMeaningVi: body.primaryMeaningVi,
        primaryMeaningEn: body.primaryMeaningEn ?? null,
        commonMistakesVi: body.commonMistakesVi ?? null,
        status: body.status,
      },
      create: {
        learningLevelId: body.learningLevelId ?? null,
        simplified: body.simplified,
        traditional: body.traditional ?? null,
        pinyin: body.pinyin,
        partOfSpeech: body.partOfSpeech ?? null,
        primaryMeaningVi: body.primaryMeaningVi,
        primaryMeaningEn: body.primaryMeaningEn ?? null,
        commonMistakesVi: body.commonMistakesVi ?? null,
        status: body.status,
        origin: body.origin,
      },
    });

    await logAdminAudit({
      actorId: actor.id,
      action: "CREATE",
      entityType: "vocabulary",
      entityId: vocab.id,
      afterData: { simplified: vocab.simplified, pinyin: vocab.pinyin, status: vocab.status },
    });

    return apiOk(vocab, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
