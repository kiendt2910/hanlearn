import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getExamAttemptSafe } from "@/modules/examinations/exam.service";
import { ExamRoom, type ExamRoomQuestion } from "@/modules/examinations/components/ExamRoom";

export const dynamic = "force-dynamic";

export default async function ExamAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { attemptId } = await params;

  const attempt = await getExamAttemptSafe(user.id, attemptId);

  if (attempt.status !== "IN_PROGRESS" || attempt.result) {
    redirect(`/exams/attempts/${attemptId}/result`);
  }

  const fullAttempt = attempt as typeof attempt & {
    examTemplate: {
      titleVi: string;
      isOfficialLicensed: boolean;
      sections: Array<{
        titleVi: string;
        questions: Array<{
          question: {
            id: string;
            questionType: string;
            skillType: string;
            promptVi: string | null;
            promptZh: string | null;
            promptPinyin: string | null;
            passageZh: string | null;
            metadata: unknown;
            options: Array<{
              optionKey: string;
              labelZh: string | null;
              labelPinyin: string | null;
              labelVi: string | null;
            }>;
          };
        }>;
      }>;
    };
    answers: Array<{
      questionId: string;
      responsePayload: unknown;
      isMarkedReview: boolean;
    }>;
  };

  const questions: ExamRoomQuestion[] = fullAttempt.examTemplate.sections.flatMap((sec) =>
    sec.questions.map((sq) => ({
      ...sq.question,
      sectionTitleVi: sec.titleVi,
      metadata: (sq.question.metadata ?? null) as Record<string, unknown> | null,
    }))
  );

  const initialAnswers: Record<
    string,
    { optionKey?: string; text?: string; orderedTokens?: string[] }
  > = {};
  const initialMarkedIds: string[] = [];

  for (const ans of fullAttempt.answers) {
    if (ans.responsePayload) {
      initialAnswers[ans.questionId] = ans.responsePayload as {
        optionKey?: string;
        text?: string;
        orderedTokens?: string[];
      };
    }
    if (ans.isMarkedReview) {
      initialMarkedIds.push(ans.questionId);
    }
  }

  return (
    <ExamRoom
      attemptId={attempt.id}
      examTitleVi={fullAttempt.examTemplate.titleVi}
      isOfficialLicensed={fullAttempt.examTemplate.isOfficialLicensed}
      expiresAtIso={attempt.expiresAt.toISOString()}
      questions={questions}
      initialAnswers={initialAnswers}
      initialMarkedIds={initialMarkedIds}
    />
  );
}
