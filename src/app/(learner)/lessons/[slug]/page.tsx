import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { LessonPlayer } from "@/modules/lessons/components/LessonPlayer";
import {
  FoundationLessonPlayer,
  type FoundationPayload,
} from "@/modules/foundation/components/FoundationLessonPlayer";

export const dynamic = "force-dynamic";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { slug } = await params;

  const [lesson, settings] = await Promise.all([
    prisma.lesson.findUnique({
      where: { slug },
      include: {
        module: {
          include: {
            course: { select: { id: true, titleVi: true, slug: true } },
          },
        },
        sections: { orderBy: { sortOrder: "asc" } },
        concepts: { take: 1 },
        lessonVocabulary: {
          orderBy: { sortOrder: "asc" },
          include: {
            vocabulary: {
              include: { examples: { orderBy: { sortOrder: "asc" }, take: 2 } },
            },
          },
        },
        lessonGrammar: {
          orderBy: { sortOrder: "asc" },
          include: {
            grammarPoint: {
              include: { examples: { orderBy: { sortOrder: "asc" } } },
            },
          },
        },
        exercises: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          include: {
            questions: {
              orderBy: { sortOrder: "asc" },
              // SECURITY: Never query QuestionAnswer here!
              select: {
                id: true,
                conceptId: true,
                questionType: true,
                promptVi: true,
                promptZh: true,
                promptPinyin: true,
                passageZh: true,
                metadata: true,
                options: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    optionKey: true,
                    labelZh: true,
                    labelPinyin: true,
                    labelVi: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.userSetting.findUnique({ where: { userId: user.id } }),
  ]);

  if (!lesson) notFound();

  const firstSectionPayload = (lesson.sections[0]?.contentPayload ?? {}) as Record<
    string,
    unknown
  >;

  // Render Zero-to-Chinese 13-part Foundation Lesson Player if enabled
  if (firstSectionPayload.foundationMode === true) {
    const payload = firstSectionPayload as unknown as FoundationPayload;
    const demoCharsList = Array.isArray(firstSectionPayload.demoCharacters)
      ? (firstSectionPayload.demoCharacters as string[])
      : [];

    const fallbackConceptId = lesson.exercises[0]?.questions[0]?.conceptId ?? null;
    const primaryConcept =
      lesson.concepts[0] ??
      (fallbackConceptId
        ? await prisma.learningConcept.findUnique({ where: { id: fallbackConceptId } })
        : null);

    const [progress, siblingLessons, demoCharacters, conceptMastery, conceptBookmark] =
      await Promise.all([
        prisma.userLessonProgress.findUnique({
          where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
        }),
        prisma.lesson.findMany({
          where: {
            status: "PUBLISHED",
            module: { courseId: lesson.module.course.id },
          },
          orderBy: [{ module: { sortOrder: "asc" } }, { sortOrder: "asc" }],
          select: { id: true, slug: true, titleVi: true },
        }),
        demoCharsList.length > 0
          ? prisma.character.findMany({
              where: { hanzi: { in: demoCharsList } },
              include: { strokes: { orderBy: { strokeOrder: "asc" } } },
            })
          : Promise.resolve([]),
        primaryConcept
          ? prisma.userConceptMastery.findUnique({
              where: {
                userId_conceptId: { userId: user.id, conceptId: primaryConcept.id },
              },
            })
          : Promise.resolve(null),
        primaryConcept
          ? prisma.userConceptBookmark.findUnique({
              where: {
                userId_conceptId: { userId: user.id, conceptId: primaryConcept.id },
              },
            })
          : Promise.resolve(null),
      ]);

    const currentIdx = siblingLessons.findIndex((s) => s.id === lesson.id);
    const prevLesson = currentIdx > 0 ? siblingLessons[currentIdx - 1] : null;
    const nextLesson =
      currentIdx >= 0 && currentIdx < siblingLessons.length - 1
        ? siblingLessons[currentIdx + 1]
        : null;

    const primaryExercise = lesson.exercises[0] ?? null;

    return (
      <FoundationLessonPlayer
        defaultShowPinyin={settings?.showPinyinByDefault ?? true}
        defaultShowTranslation={settings?.showTranslationDefault ?? true}
        lesson={{
          id: lesson.id,
          slug: lesson.slug,
          titleVi: lesson.titleVi,
          titleZh: lesson.titleZh,
          subtitleVi: lesson.subtitleVi,
          estimatedMinutes: lesson.estimatedMinutes,
          status: progress?.status ?? "NOT_STARTED",
          payload,
          concept: primaryConcept
            ? {
                id: primaryConcept.id,
                code: primaryConcept.code,
                titleVi: primaryConcept.titleVi,
                masteryScore: Math.round(conceptMastery?.masteryScore ?? 0),
                bookmarked: Boolean(conceptBookmark),
              }
            : null,
          prevLesson,
          nextLesson,
          demoCharacters,
          exercise: primaryExercise
            ? {
                id: primaryExercise.id,
                titleVi: primaryExercise.titleVi,
                passingPercent: primaryExercise.passingPercent,
                questions: primaryExercise.questions.map((q) => ({
                  ...q,
                  metadata: (q.metadata ?? null) as Record<string, unknown> | null,
                })),
              }
            : null,
        }}
      />
    );
  }

  // Standard 8-Section Lesson Engine (HSK 1 – Advanced/Business)
  const writingSection = lesson.sections.find((s) => s.sectionType === "WRITING");
  const charList = Array.isArray(
    (writingSection?.contentPayload as { characters?: string[] })?.characters
  )
    ? (writingSection?.contentPayload as { characters: string[] }).characters
    : [];

  const [progress, characters] = await Promise.all([
    prisma.userLessonProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    }),
    charList.length > 0
      ? prisma.character.findMany({
          where: { hanzi: { in: charList } },
          include: { strokes: { orderBy: { strokeOrder: "asc" } } },
        })
      : Promise.resolve([]),
  ]);

  return (
    <LessonPlayer
      defaultShowPinyin={settings?.showPinyinByDefault ?? true}
      defaultShowTranslation={settings?.showTranslationDefault ?? true}
      lesson={{
        id: lesson.id,
        slug: lesson.slug,
        titleVi: lesson.titleVi,
        titleZh: lesson.titleZh,
        subtitleVi: lesson.subtitleVi,
        courseTitleVi: lesson.module.course.titleVi,
        courseSlug: lesson.module.course.slug,
        estimatedMinutes: lesson.estimatedMinutes,
        isSkippable: lesson.isSkippable,
        objectivesVi: Array.isArray(lesson.objectivesVi)
          ? (lesson.objectivesVi as string[])
          : [],
        completedSections: Array.isArray(progress?.completedSections)
          ? (progress.completedSections as string[])
          : [],
        status: progress?.status ?? "NOT_STARTED",
        sections: lesson.sections.map((s) => ({
          id: s.id,
          sectionType: s.sectionType,
          titleVi: s.titleVi,
          contentPayload: (s.contentPayload ?? {}) as Record<string, unknown>,
        })),
        vocabulary: lesson.lessonVocabulary.map((lv) => lv.vocabulary),
        grammar: lesson.lessonGrammar.map((lg) => lg.grammarPoint),
        characters,
        exercises: lesson.exercises.map((ex) => ({
          id: ex.id,
          titleVi: ex.titleVi,
          passingPercent: ex.passingPercent,
          questions: ex.questions.map((q) => ({
            ...q,
            metadata: (q.metadata ?? null) as Record<string, unknown> | null,
          })),
        })),
      }}
    />
  );
}
