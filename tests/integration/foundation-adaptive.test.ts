import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  computeFoundationReadiness,
  recordConceptAttempt,
} from "@/modules/foundation/adaptive.service";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("Zero-to-Chinese Foundation Integration & Adaptive Mastery", () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("seeds all 18 required radicals and components across People, Nature, and Daily Life", async () => {
    const radicals = await prisma.radicalComponent.findMany({
      where: { status: "PUBLISHED" },
    });
    expect(radicals.length).toBeGreaterThanOrEqual(18);
    const symbols = radicals.map((r) => r.symbol);
    for (const req of ["人", "口", "女", "子", "日", "月", "木", "水", "火", "土", "手", "心", "言", "艹", "宀", "纟", "金", "足"]) {
      expect(symbols).toContain(req);
    }
  });

  it("seeds Sample Lessons A, B, C and Stage 7 Multi-Skill Foundation Assessment", async () => {
    const sampleSlugs = [
      "foundations-pinyin-tones",
      "foundations-basic-strokes",
      "foundation-s3-radicals-and-components",
    ];

    for (const slug of sampleSlugs) {
      const lesson = await prisma.lesson.findUnique({
        where: { slug },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      });
      expect(lesson).not.toBeNull();
      const payload = (lesson?.sections[0]?.contentPayload ?? {}) as Record<string, unknown>;
      expect(payload.foundationMode).toBe(true);
    }

    const stage7 = await prisma.examTemplate.findUnique({
      where: { slug: "foundation-final-assessment" },
    });
    expect(stage7).not.toBeNull();
  });

  it("triggers adaptive remediation with simpler explanation and easier practice after 2 consecutive misses", async () => {
    const learner = await prisma.user.findUniqueOrThrow({
      where: { email: "learner@hanlearn.local" },
    });
    const concept = await prisma.learningConcept.findUniqueOrThrow({
      where: { code: "foundation.tones.four_basic" },
    });

    await prisma.userConceptMastery.deleteMany({
      where: { userId: learner.id, conceptId: concept.id },
    });

    const firstMiss = await recordConceptAttempt(learner.id, concept.id, false, prisma);
    expect(firstMiss).toBeNull();

    const secondMiss = await recordConceptAttempt(learner.id, concept.id, false, prisma);
    expect(secondMiss).not.toBeNull();
    expect(secondMiss?.consecutiveMisses).toBe(2);
    expect(secondMiss?.simpleExplanationVi.length).toBeGreaterThan(10);
    expect(secondMiss?.extraExamples.length).toBeGreaterThan(0);
    expect(secondMiss?.remediationQuestion).not.toBeNull();

    // Clean up test mastery record
    await prisma.userConceptMastery.deleteMany({
      where: { userId: learner.id, conceptId: concept.id },
    });
  });

  it("evaluates all 6 Foundation pillars before declaring HSK 1 readiness", async () => {
    const learner = await prisma.user.findUniqueOrThrow({
      where: { email: "learner@hanlearn.local" },
    });
    const readiness = await computeFoundationReadiness(learner.id, prisma);
    expect(readiness.pillarBreakdown.length).toBe(6);
    expect(readiness.readyForHsk1).toBe(false);
  });
});
