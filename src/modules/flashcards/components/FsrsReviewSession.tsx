"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";
import { enqueueOfflineMutation } from "@/modules/offline/idb-client";

export interface ReviewCardItem {
  id: string;
  deckName: string;
  frontZh: string;
  frontPinyin?: string | null;
  backVi: string;
  exampleZh?: string | null;
  exampleVi?: string | null;
  notesVi?: string | null;
  stateLabel: string;
  stability: number;
  difficulty: number;
  intervalPreviews: Record<"AGAIN" | "HARD" | "GOOD" | "EASY", string>;
}

const RATINGS: Array<{
  key: "AGAIN" | "HARD" | "GOOD" | "EASY";
  shortcut: string;
  label: string;
  style: string;
}> = [
  { key: "AGAIN", shortcut: "1", label: "Quên", style: "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40" },
  { key: "HARD", shortcut: "2", label: "Khó", style: "border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40" },
  { key: "GOOD", shortcut: "3", label: "Tốt", style: "border-emerald-300 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40" },
  { key: "EASY", shortcut: "4", label: "Dễ", style: "border-blue-300 text-blue-800 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40" },
];

export function FsrsReviewSession({ initialCards }: { initialCards: ReviewCardItem[] }) {
  const [queue, setQueue] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const current = queue[0];

  const handleRate = useCallback(
    async (rating: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
      if (!current || submitting) return;
      setSubmitting(true);
      const clientMutationId = crypto.randomUUID();

      try {
        if (!navigator.onLine) {
          await enqueueOfflineMutation({
            entityType: "flashcard_review",
            operationType: "FSRS_REVIEW",
            payload: { flashcardId: current.id, rating },
          });
          toast.info("Đã lưu lượt ôn vào hàng đợi ngoại tuyến.");
        } else {
          const res = await fetch("/api/v1/flashcards/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flashcardId: current.id,
              rating,
              clientMutationId,
            }),
          });
          if (!res.ok) throw new Error();
        }

        setCompletedCount((c) => c + 1);
        setRevealed(false);
        setQueue((prev) =>
          rating === "AGAIN" ? [...prev.slice(1), prev[0]] : prev.slice(1)
        );
      } catch {
        toast.error("Không thể lưu đánh giá FSRS.");
      } finally {
        setSubmitting(false);
      }
    },
    [current, submitting]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!current) return;
      if (e.code === "Space" && !revealed) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed) {
        if (e.key === "1") handleRate("AGAIN");
        if (e.key === "2") handleRate("HARD");
        if (e.key === "3") handleRate("GOOD");
        if (e.key === "4") handleRate("EASY");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, revealed, handleRate]);

  if (!current) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          <h2 className="text-lg font-semibold text-foreground">
            Bạn đã hoàn thành phiên ôn tập FSRS!
          </h2>
          <p className="text-sm text-muted-foreground">
            Đã ôn {completedCount} lượt thẻ. Các thẻ tiếp theo sẽ xuất hiện đúng thời điểm tối ưu ghi nhớ.
          </p>
          <div className="mt-2 flex gap-2">
            <Button asChild>
              <Link href="/flashcards">Quay lại bộ thẻ</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/lessons">Tiếp tục bài học</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <Link href="/flashcards" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại bộ thẻ
        </Link>
        <span>
          Bộ: <strong className="text-foreground">{current.deckName}</strong> • Còn lại:{" "}
          <strong className="text-foreground">{queue.length}</strong> thẻ
        </span>
        <span>Phím tắt: Space (lật), 1–4 (đánh giá)</span>
      </div>

      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{current.stateLabel}</Badge>
            <ChineseAudioPlayer textZh={current.frontZh} compact />
          </div>

          <div lang="zh-Hans" className="font-hanzi text-4xl font-bold text-foreground">
            {current.frontZh}
          </div>

          {current.frontPinyin ? (
            <div className="font-pinyin text-base font-medium text-primary">
              {current.frontPinyin}
            </div>
          ) : null}

          {!revealed ? (
            <Button type="button" className="mt-4" onClick={() => setRevealed(true)}>
              Hiện đáp án (Space)
            </Button>
          ) : (
            <div className="mt-3 w-full space-y-3 border-t border-border pt-4 text-left">
              <div className="text-center text-lg font-semibold text-foreground">
                {current.backVi}
              </div>
              {current.exampleZh ? (
                <div className="rounded-md border border-border bg-background p-3 text-sm">
                  <div lang="zh-Hans" className="font-hanzi text-base text-foreground">
                    {current.exampleZh}
                  </div>
                  {current.exampleVi ? (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {current.exampleVi}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {current.notesVi ? (
                <p className="text-xs text-muted-foreground">
                  <strong>Ghi chú:</strong> {current.notesVi}
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RATINGS.map((r) => (
            <button
              key={r.key}
              type="button"
              disabled={submitting}
              onClick={() => handleRate(r.key)}
              className={`flex flex-col items-center rounded-md border bg-surface px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${r.style}`}
            >
              <span>
                {r.shortcut}. {r.label}
              </span>
              <span className="mt-0.5 text-[11px] font-normal opacity-80">
                {current.intervalPreviews[r.key]}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
