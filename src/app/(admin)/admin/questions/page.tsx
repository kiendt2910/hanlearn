import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAnswerKeyHuman } from "@/lib/utils/format-answer";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      answers: true,
      explanations: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Ngân hàng Câu hỏi & Đáp án ({questions.length})</h1>
        <p className="text-sm text-muted-foreground">
          Đáp án chuẩn chỉ hiển thị trong khu vực quản trị CMS, tuyệt đối không trả về trình duyệt học viên trước khi nộp bài.
        </p>
      </div>

      <div className="space-y-2.5">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="space-y-1.5 p-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{q.questionType}</Badge>
                <Badge variant="secondary">{q.skillType}</Badge>
                <Badge variant="outline">{q.status}</Badge>
                <span className="text-muted-foreground">{q.points} điểm</span>
              </div>
              {q.promptVi ? <p className="text-sm font-medium">{q.promptVi}</p> : null}
              {q.promptZh ? (
                <p lang="zh-Hans" className="font-hanzi text-base text-primary">
                  {q.promptZh}
                </p>
              ) : null}
              <p className="text-muted-foreground">
                <strong>Đáp án chuẩn:</strong>{" "}
                <span lang="zh-Hans" className="font-hanzi text-sm text-foreground">
                  {formatAnswerKeyHuman(q.answers[0]?.acceptedPayload)}
                </span>
              </p>
              {q.explanations[0]?.explanationVi ? (
                <p className="text-muted-foreground">
                  <strong>Giải thích:</strong> {q.explanations[0].explanationVi}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
