import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";

const bookmarkSchema = z.object({
  conceptId: z.string().uuid(),
  noteVi: z.string().trim().max(300).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = bookmarkSchema.parse(await request.json());

    const existing = await prisma.userConceptBookmark.findUnique({
      where: {
        userId_conceptId: { userId: user.id, conceptId: body.conceptId },
      },
    });

    if (existing) {
      await prisma.userConceptBookmark.delete({ where: { id: existing.id } });
      return apiOk({ bookmarked: false, conceptId: body.conceptId });
    }

    await prisma.userConceptBookmark.create({
      data: {
        userId: user.id,
        conceptId: body.conceptId,
        noteVi: body.noteVi ?? null,
      },
    });
    return apiOk({ bookmarked: true, conceptId: body.conceptId }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
