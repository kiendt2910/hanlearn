import { PrismaClient, RoleCode, ContentOrigin, ContentStatus, CurriculumFramework } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCurriculumContent } from "./curriculum-content";
import { seedZeroToChineseFoundation } from "./foundation-curriculum";

const prisma = new PrismaClient();

async function seedRoles() {
  const roles = [
    {
      code: RoleCode.ADMIN,
      name: "Quản trị viên hệ thống",
      description: "Toàn quyền quản trị nội dung, người dùng, cấu hình AI và cài đặt hệ thống.",
    },
    {
      code: RoleCode.CONTENT_EDITOR,
      name: "Biên tập viên nội dung",
      description: "Quản lý giáo trình, bài học, từ vựng, ngữ pháp, ngân hàng câu hỏi và đề thi. Không có quyền quản trị hệ thống.",
    },
    {
      code: RoleCode.LEARNER,
      name: "Học viên",
      description: "Truy cập chương trình học, luyện tập, flashcard FSRS, thi thử HSK và gia sư AI.",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }
}

async function seedCurriculumVersions() {
  const versions = [
    {
      code: "hsk-2.0-v1",
      name: "Khung HSK Truyền thống (6 Cấp)",
      framework: CurriculumFramework.HSK_2_0,
      versionTag: "1.0.0",
      description:
        "Lộ trình học từ Nền tảng tiếng Trung đến HSK 1–6, Tiếng Trung nâng cao, Thương mại và Học thuật. Các chỉ số cấp độ và đề thi được cấu hình linh hoạt trong hệ thống.",
      isDefault: true,
      status: ContentStatus.PUBLISHED,
      origin: ContentOrigin.VERIFIED_ORIGINAL,
      publishedAt: new Date(),
      metadata: {
        configurable: true,
        supportsPlacementTest: true,
        noteVi: "Thông số từ vựng và cấu trúc bài thi được cấu hình theo từng mẫu đề trong quản trị.",
      },
    },
    {
      code: "hsk-3.0-v1",
      name: "Khung HSK 3.0 (Cấu hình mở rộng)",
      framework: CurriculumFramework.HSK_3_0,
      versionTag: "1.0.0",
      description:
        "Phiên bản giáo trình tách biệt dành cho lộ trình HSK 3.0 theo tiêu chuẩn năng lực tiếng Trung quốc tế, cho phép cấu hình cấp độ và quy chuẩn đánh giá độc lập.",
      isDefault: false,
      status: ContentStatus.PUBLISHED,
      origin: ContentOrigin.VERIFIED_ORIGINAL,
      publishedAt: new Date(),
      metadata: {
        configurable: true,
        supportsPlacementTest: true,
        noteVi: "Cấu trúc cấp độ và mẫu đề thi được cập nhật qua CMS khi xác minh tiêu chuẩn áp dụng.",
      },
    },
  ];

  for (const version of versions) {
    await prisma.curriculumVersion.upsert({
      where: { code: version.code },
      update: {
        name: version.name,
        description: version.description,
        isDefault: version.isDefault,
        status: version.status,
      },
      create: version,
    });
  }
}

async function seedDefaultUsers() {
  const defaultCurriculum = await prisma.curriculumVersion.findUnique({
    where: { code: "hsk-2.0-v1" },
  });

  const allRoles = await prisma.role.findMany();
  const roleByCode = new Map(allRoles.map((r) => [r.code, r.id]));

  const seedAccounts = [
    {
      email: "admin@hanlearn.local",
      password: process.env.SEED_ADMIN_PASSWORD ?? "Admin@123456",
      displayName: "Quản trị viên HanLearn",
      roleCode: RoleCode.ADMIN,
    },
    {
      email: "editor@hanlearn.local",
      password: process.env.SEED_EDITOR_PASSWORD ?? "Editor@123456",
      displayName: "Biên tập viên Nội dung",
      roleCode: RoleCode.CONTENT_EDITOR,
    },
    {
      email: "learner@hanlearn.local",
      password: process.env.SEED_LEARNER_PASSWORD ?? "Learner@123456",
      displayName: "Minh (Học viên mẫu)",
      roleCode: RoleCode.LEARNER,
    },
  ];

  for (const account of seedAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { isActive: true },
      create: {
        email: account.email,
        passwordHash,
        isActive: true,
        profile: {
          create: {
            displayName: account.displayName,
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
      },
    });

    const roleId = roleByCode.get(account.roleCode);
    if (roleId) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      });
    }
  }
}

async function seedSystemSettings() {
  const defaults = [
    {
      key: "platform.name",
      value: { vi: "HanLearn", taglineVi: "Nền tảng học tiếng Trung cho người Việt" },
      isSecret: false,
      description: "Tên và khẩu hiệu hệ thống",
    },
    {
      key: "ai.rate_limits",
      value: { dailyMessagesPerLearner: 30, maxTokensPerResponse: 1200 },
      isSecret: false,
      description: "Giới hạn sử dụng Gia sư AI mỗi ngày cho học viên",
    },
    {
      key: "pronunciation.capabilities",
      value: { toneScoringSupported: false, provider: "none" },
      isSecret: false,
      description: "Trạng thái tích hợp chấm điểm thanh điệu chuyên biệt",
    },
  ];

  for (const setting of defaults) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
}

async function main() {
  console.log("[HanLearn Seed] Seeding roles...");
  await seedRoles();

  console.log("[HanLearn Seed] Seeding curriculum versions...");
  await seedCurriculumVersions();

  console.log("[HanLearn Seed] Seeding baseline accounts...");
  await seedDefaultUsers();

  console.log("[HanLearn Seed] Seeding curriculum content (levels, courses, 8-section lessons, vocab, grammar, exercises, exams)...");
  await seedCurriculumContent(prisma);

  console.log("[HanLearn Seed] Seeding Zero-to-Chinese Foundation (Stages 0–7, 18 Radicals, Adaptive Concepts & Sample Lessons A/B/C)...");
  await seedZeroToChineseFoundation(prisma);

  console.log("[HanLearn Seed] Seeding system settings...");
  await seedSystemSettings();

  console.log("[HanLearn Seed] Completed full platform seed.");
}

main()
  .catch((error) => {
    console.error("[HanLearn Seed] Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
