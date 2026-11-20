import { afterAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { PrismaClient, RoleCode } from "@prisma/client";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("Phase 0 — PostgreSQL Migration & Seed Integrity", () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("seeds all three RBAC roles (ADMIN, CONTENT_EDITOR, LEARNER)", async () => {
    const roles = await prisma.role.findMany({ orderBy: { code: "asc" } });
    const codes = roles.map((r) => r.code);
    expect(codes).toContain(RoleCode.ADMIN);
    expect(codes).toContain(RoleCode.CONTENT_EDITOR);
    expect(codes).toContain(RoleCode.LEARNER);
  });

  it("seeds both HSK 2.0 and HSK 3.0 as separate published curriculum versions", async () => {
    const versions = await prisma.curriculumVersion.findMany({
      where: { status: "PUBLISHED" },
    });
    const frameworks = versions.map((v) => v.framework);
    expect(frameworks).toContain("HSK_2_0");
    expect(frameworks).toContain("HSK_3_0");
  });

  it("seeds baseline accounts with valid bcrypt hashes and proper role bindings", async () => {
    const learner = await prisma.user.findUnique({
      where: { email: "learner@hanlearn.local" },
      include: {
        profile: true,
        settings: true,
        userRoles: { include: { role: true } },
      },
    });

    expect(learner).not.toBeNull();
    expect(learner?.profile?.nativeLanguage).toBe("vi");
    expect(learner?.settings?.showPinyinByDefault).toBe(true);
    expect(learner?.userRoles.map((ur) => ur.role.code)).toEqual([RoleCode.LEARNER]);
    expect(
      await bcrypt.compare("Learner@123456", learner?.passwordHash ?? "")
    ).toBe(true);
  });
});
