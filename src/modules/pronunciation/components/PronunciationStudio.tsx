"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorderCompare } from "@/components/chinese/VoiceRecorderCompare";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TONE_DRILLS = [
  { zh: "妈、麻、马、骂", pinyin: "mā, má, mǎ, mà", vi: "4 thanh điệu cơ bản: Mẹ, cây gai, ngựa, mắng" },
  { zh: "你好！很高兴认识你。", pinyin: "Nǐ hǎo! Hěn gāoxìng rènshi nǐ.", vi: "Biến điệu thanh 3 (ní hǎo) & giao tiếp chào hỏi" },
  { zh: "谢谢你的帮助。", pinyin: "Xièxie nǐ de bāngzhù.", vi: "Thanh nhẹ ở âm tiết thứ hai (xièxie)" },
  { zh: "我家有四口人。", pinyin: "Wǒ jiā yǒu sì kǒu rén.", vi: "Luyện âm s / k / r rõ nét" },
];

export function PronunciationStudio({
  history,
}: {
  history: Array<{
    id: string;
    targetTextZh: string;
    targetPinyin: string;
    createdAt: string;
    feedback: Array<{
      evaluationMode: string;
      recognizedTranscriptZh: string | null;
      transcriptMatchPercent: number | null;
      toneScoringSupported: boolean;
      feedbackVi: string;
    }>;
  }>;
}) {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = TONE_DRILLS[selectedIdx];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TONE_DRILLS.map((d, idx) => (
          <button
            key={d.zh}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium cursor-pointer ${
              idx === selectedIdx
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            Bài tập {idx + 1}: <span className="font-hanzi">{d.zh.slice(0, 8)}</span>
          </button>
        ))}
      </div>

      <VoiceRecorderCompare
        targetTextZh={current.zh}
        targetPinyin={current.pinyin}
        meaningVi={current.vi}
        onSavedAttempt={() => router.refresh()}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lịch sử luyện phát âm ({history.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có lượt luyện phát âm nào được lưu. Hãy ghi âm và bấm &ldquo;Lưu lượt luyện&rdquo;.
            </p>
          ) : (
            history.map((h) => {
              const fb = h.feedback[0];
              return (
                <div
                  key={h.id}
                  className="rounded-md border border-border bg-background p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span lang="zh-Hans" className="font-hanzi text-base font-medium text-foreground">
                      {h.targetTextZh}
                    </span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline">{fb?.evaluationMode ?? "SELF_COMPARE"}</Badge>
                      <Badge variant="secondary">
                        Chấm thanh điệu: {fb?.toneScoringSupported ? "Có" : "Chưa kích hoạt"}
                      </Badge>
                    </div>
                  </div>
                  {fb?.recognizedTranscriptZh ? (
                    <p className="mt-1 text-foreground">
                      STT nhận diện: <span className="font-hanzi">{fb.recognizedTranscriptZh}</span> (
                      {fb.transcriptMatchPercent}%)
                    </p>
                  ) : null}
                  <p className="mt-1 text-muted-foreground">{fb?.feedbackVi}</p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
