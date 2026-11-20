"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Flag, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";
import { cn } from "@/lib/utils/cn";

export interface ExamRoomQuestion {
  id: string;
  sectionTitleVi: string;
  questionType: string;
  skillType: string;
  promptVi?: string | null;
  promptZh?: string | null;
  promptPinyin?: string | null;
  passageZh?: string | null;
  metadata?: Record<string, unknown> | null;
  options: Array<{
    optionKey: string;
    labelZh?: string | null;
    labelPinyin?: string | null;
    labelVi?: string | null;
  }>;
}

export function ExamRoom({
  attemptId,
  examTitleVi,
  isOfficialLicensed,
  expiresAtIso,
  questions,
  initialAnswers,
  initialMarkedIds,
}: {
  attemptId: string;
  examTitleVi: string;
  isOfficialLicensed: boolean;
  expiresAtIso: string;
  questions: ExamRoomQuestion[];
  initialAnswers: Record<
    string,
    { optionKey?: string; text?: string; orderedTokens?: string[] }
  >;
  initialMarkedIds: string[];
}) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set(initialMarkedIds));
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000))
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submitExam = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/v1/exams/attempts/${attemptId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAutoSubmit }),
        });
        if (!res.ok) throw new Error();
        toast.success(
          isAutoSubmit
            ? "Đã hết giờ! Hệ thống đã tự động nộp bài."
            : "Nộp bài thi thành công!"
        );
        router.push(`/exams/attempts/${attemptId}/result`);
        router.refresh();
      } catch {
        toast.error("Lỗi khi nộp bài thi. Vui lòng thử lại.");
        setSubmitting(false);
      }
    },
    [attemptId, router, submitting]
  );

  // Real countdown timer synced to server expiresAt
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        submitExam(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAtIso, submitExam]);

  const current = questions[currentIdx];

  const persistAnswer = async (
    questionId: string,
    payload?: { optionKey?: string; text?: string; orderedTokens?: string[] },
    isMarkedReview?: boolean
  ) => {
    try {
      await fetch(`/api/v1/exams/attempts/${attemptId}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          ...(payload !== undefined ? { responsePayload: payload } : {}),
          ...(isMarkedReview !== undefined ? { isMarkedReview } : {}),
        }),
      });
    } catch {
      // Non-blocking save; server enforces expiry
    }
  };

  const updateAnswer = (
    questionId: string,
    payload: { optionKey?: string; text?: string; orderedTokens?: string[] }
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: payload }));
    persistAnswer(questionId, payload);
  };

  const toggleMarkReview = (questionId: string) => {
    const next = new Set(markedIds);
    const willMark = !next.has(questionId);
    if (willMark) next.add(questionId);
    else next.delete(questionId);
    setMarkedIds(next);
    persistAnswer(questionId, undefined, willMark);
  };

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return Boolean(a?.optionKey || a?.text?.trim() || (a?.orderedTokens?.length ?? 0) > 0);
  }).length;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  if (!current) return null;

  const currentAns = answers[current.id] ?? {};
  const tokens = Array.isArray(current.metadata?.tokens)
    ? (current.metadata.tokens as string[])
    : [];

  return (
    <div className="space-y-4">
      {/* Exam Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-foreground sm:text-base">{examTitleVi}</h1>
            <Badge variant={isOfficialLicensed ? "default" : "secondary"}>
              {isOfficialLicensed ? "Chính thức" : "Luyện tập gốc"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{current.sectionTitleVi}</p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-sm font-bold",
              secondsLeft <= 120
                ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                : "border-border bg-background text-foreground"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>
              {mins}:{secs}
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
          >
            <Send className="h-3.5 w-3.5" />
            Nộp bài thi
          </Button>
        </div>
      </div>

      {/* Confirm Submit Banner */}
      {confirmOpen ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary bg-accent/70 p-4 text-sm">
          <div>
            <strong>Xác nhận nộp bài thi?</strong> Bạn đã trả lời{" "}
            <strong>
              {answeredCount}/{questions.length}
            </strong>{" "}
            câu hỏi ({markedIds.size} câu đánh dấu xem lại). Sau khi nộp, hệ thống sẽ chấm điểm và hiển thị giải thích.
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Tiếp tục làm bài
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => submitExam(false)}
              disabled={submitting}
            >
              {submitting ? "Đang chấm điểm..." : "Xác nhận nộp ngay"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Main Question Area + Question Palette */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm font-semibold text-foreground">
                Câu {currentIdx + 1} / {questions.length}
              </span>
              <Button
                type="button"
                size="sm"
                variant={markedIds.has(current.id) ? "default" : "outline"}
                onClick={() => toggleMarkReview(current.id)}
              >
                <Flag className="h-3.5 w-3.5" />
                {markedIds.has(current.id) ? "Đã đánh dấu xem lại" : "Đánh dấu xem lại"}
              </Button>
            </div>

            {current.promptVi ? (
              <p className="text-sm font-medium text-foreground">{current.promptVi}</p>
            ) : null}

            {current.passageZh ? (
              <div
                lang="zh-Hans"
                className="font-hanzi rounded-md border border-border bg-background p-4 text-lg leading-relaxed"
              >
                {current.passageZh}
              </div>
            ) : null}

            {current.promptZh ? (
              <div className="space-y-2">
                {current.questionType === "LISTENING_COMPREHENSION" ? (
                  <ChineseAudioPlayer textZh={current.promptZh} />
                ) : (
                  <div lang="zh-Hans" className="font-hanzi text-xl font-semibold text-foreground">
                    {current.promptZh}
                  </div>
                )}
              </div>
            ) : null}

            {/* Options */}
            {current.options.length > 0 ? (
              <div className="space-y-2">
                {current.options.map((opt) => {
                  const selected = currentAns.optionKey === opt.optionKey;
                  return (
                    <button
                      key={opt.optionKey}
                      type="button"
                      onClick={() => updateAnswer(current.id, { optionKey: opt.optionKey })}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md border px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer",
                        selected
                          ? "border-primary bg-accent text-accent-foreground font-medium"
                          : "border-border bg-surface hover:bg-surface-muted"
                      )}
                    >
                      <span className="font-bold">{opt.optionKey}.</span>
                      {opt.labelZh ? (
                        <span lang="zh-Hans" className="font-hanzi text-base">
                          {opt.labelZh}
                        </span>
                      ) : null}
                      {opt.labelVi ? <span>{opt.labelVi}</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Text Input */}
            {current.questionType === "FILL_IN_BLANK" ||
            current.questionType === "TRANSLATION" ? (
              <input
                type="text"
                value={currentAns.text ?? ""}
                onChange={(e) => updateAnswer(current.id, { text: e.target.value })}
                placeholder="Nhập câu trả lời tiếng Trung..."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              />
            ) : null}

            {/* Sentence Ordering */}
            {current.questionType === "SENTENCE_ORDERING" && tokens.length > 0 ? (
              <div className="space-y-2">
                <div className="min-h-11 rounded-md border border-dashed border-border bg-background p-2">
                  {(currentAns.orderedTokens ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(currentAns.orderedTokens ?? []).map((tok, i) => (
                        <button
                          key={`${tok}-${i}`}
                          type="button"
                          onClick={() =>
                            updateAnswer(current.id, {
                              orderedTokens: (currentAns.orderedTokens ?? []).filter(
                                (_, idx) => idx !== i
                              ),
                            })
                          }
                          className="font-hanzi rounded border border-primary bg-accent px-2.5 py-1 text-sm text-accent-foreground cursor-pointer"
                        >
                          {tok}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Chọn lần lượt từng từ bên dưới để ghép câu hoàn chỉnh...
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tokens.map((tok) => {
                    const used = (currentAns.orderedTokens ?? []).includes(tok);
                    return (
                      <button
                        key={tok}
                        type="button"
                        disabled={used}
                        onClick={() =>
                          updateAnswer(current.id, {
                            orderedTokens: [...(currentAns.orderedTokens ?? []), tok],
                          })
                        }
                        className="font-hanzi rounded-md border border-border bg-surface px-3 py-1 text-sm hover:bg-surface-muted disabled:opacity-40 cursor-pointer"
                      >
                        {tok}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex justify-between border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              >
                Câu trước
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={currentIdx >= questions.length - 1}
                onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              >
                Câu tiếp theo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Question Navigation Palette */}
        <Card className="lg:col-span-4">
          <CardContent className="space-y-4 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bảng điều hướng câu hỏi ({answeredCount}/{questions.length} đã trả lời)
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const a = answers[q.id];
                const answered = Boolean(
                  a?.optionKey || a?.text?.trim() || (a?.orderedTokens?.length ?? 0) > 0
                );
                const flagged = markedIds.has(q.id);
                const active = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={cn(
                      "relative h-9 rounded-md border text-xs font-semibold transition-colors cursor-pointer",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : answered
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                        : "border-border bg-background text-foreground hover:bg-surface-muted"
                    )}
                  >
                    {idx + 1}
                    {flagged ? (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
