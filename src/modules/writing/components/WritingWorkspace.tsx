"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HanziStrokeCanvas,
  type CharacterStrokeItem,
} from "@/components/chinese/HanziStrokeCanvas";

interface SubmissionItem {
  id: string;
  revisionNumber: number;
  taskType: string;
  promptText?: string | null;
  submittedText: string;
  characterCount: number;
  createdAt: string;
  feedback: Array<{
    id: string;
    correctedVersionZh: string;
    grammarIssues: Array<{ span: string; explanationVi: string; suggestion: string }>;
    vocabSuggestions: Array<{ original: string; suggested: string; reasonVi: string }>;
    naturalnessFeedback: string;
    overallExplanationVi: string;
    recommendationsVi: string[];
  }>;
}

const TASK_TYPES = [
  { value: "SENTENCE_CONSTRUCTION", label: "Viết câu hoàn chỉnh" },
  { value: "PARAGRAPH_WRITING", label: "Viết đoạn văn ngắn" },
  { value: "TRANSLATION", label: "Dịch Việt → Trung" },
  { value: "VOCABULARY_WRITING", label: "Đặt câu với từ vựng" },
  { value: "FREE_WRITING", label: "Viết tự do" },
];

export function WritingWorkspace({
  characters,
  initialSubmissions,
}: {
  characters: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
    mnemonicVi?: string | null;
    strokes: CharacterStrokeItem[];
  }>;
  initialSubmissions: SubmissionItem[];
}) {
  const router = useRouter();
  const [selectedChar, setSelectedChar] = useState(characters[0]?.hanzi ?? "");
  const [taskType, setTaskType] = useState("SENTENCE_CONSTRUCTION");
  const [promptText, setPromptText] = useState(
    "Giới thiệu bản thân và gia đình bạn bằng 2–3 câu tiếng Trung."
  );
  const [submittedText, setSubmittedText] = useState("");
  const [parentSubmissionId, setParentSubmissionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);

  const activeChar = characters.find((c) => c.hanzi === selectedChar) ?? characters[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittedText.trim()) {
      toast.error("Vui lòng nhập đoạn viết tiếng Trung.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/writing/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType,
          promptText,
          submittedText,
          parentSubmissionId: parentSubmissionId ?? undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();

      const created: SubmissionItem = {
        ...json.data.submission,
        createdAt: new Date(json.data.submission.createdAt).toISOString(),
        feedback: [json.data.feedback],
      };

      setSubmissions((prev) => [created, ...prev]);
      setParentSubmissionId(null);
      toast.success("Đã chấm bài viết và lưu lịch sử phiên bản.");
      router.refresh();
    } catch {
      toast.error("Không thể gửi bài viết.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Character Stroke Practice */}
      {activeChar ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Chọn chữ Hán luyện bút thuận:
            </span>
            {characters.map((ch) => (
              <Button
                key={ch.hanzi}
                type="button"
                size="sm"
                variant={ch.hanzi === activeChar.hanzi ? "default" : "outline"}
                onClick={() => setSelectedChar(ch.hanzi)}
                className="font-hanzi text-base"
              >
                {ch.hanzi}
              </Button>
            ))}
          </div>
          <HanziStrokeCanvas
            hanzi={activeChar.hanzi}
            pinyin={activeChar.pinyin}
            meaningVi={activeChar.meaningVi}
            mnemonicVi={activeChar.mnemonicVi}
            strokes={activeChar.strokes}
          />
        </div>
      ) : null}

      {/* Writing Composition Form */}
      <Card>
        <CardHeader>
          <CardTitle>Không gian Viết câu, Đoạn văn & Chữa bài</CardTitle>
          <CardDescription>
            Lưu toàn bộ bản gốc và lịch sử chỉnh sửa (Revision), nhận góp ý ngữ pháp, từ vựng và độ tự nhiên bằng tiếng Việt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Dạng bài luyện viết
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Đề bài / Yêu cầu
                </label>
                <input
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
                />
              </div>
            </div>

            {parentSubmissionId ? (
              <div className="flex items-center justify-between rounded-md border border-primary/30 bg-accent/50 px-3 py-2 text-xs">
                <span>Đang viết bản sửa mới (Revision) từ bài nộp trước.</span>
                <button
                  type="button"
                  onClick={() => setParentSubmissionId(null)}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Hủy liên kết
                </button>
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Bài viết tiếng Trung của bạn
              </label>
              <textarea
                rows={4}
                lang="zh-Hans"
                value={submittedText}
                onChange={(e) => setSubmittedText(e.target.value)}
                placeholder="Ví dụ: 你好！我叫明安，我家有四口人。"
                className="font-hanzi w-full rounded-md border border-border bg-surface p-3 text-lg"
              />
            </div>

            <Button type="submit" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "Đang phân tích & lưu..." : "Gửi bài viết nhận góp ý"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Submission & Revision History */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Lịch sử bài viết & Phản hồi ({submissions.length})
        </h2>
        {submissions.map((sub) => {
          const fb = sub.feedback[0];
          return (
            <Card key={sub.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Bản #{sub.revisionNumber}</Badge>
                    <Badge variant="secondary">{sub.taskType}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {sub.characterCount} ký tự
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setParentSubmissionId(sub.id);
                      setSubmittedText(fb?.correctedVersionZh || sub.submittedText);
                      setPromptText(sub.promptText || promptText);
                      toast.info("Đã nạp nội dung để tạo bản chỉnh sửa (Revision).");
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Viết bản sửa (Revision)
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-md border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Bản gốc của bạn:</div>
                  <div lang="zh-Hans" className="font-hanzi mt-1 text-lg">
                    {sub.submittedText}
                  </div>
                </div>

                {fb ? (
                  <div className="space-y-2.5 rounded-md border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div>
                      <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Bản gợi ý chuẩn hóa:
                      </div>
                      <div lang="zh-Hans" className="font-hanzi mt-1 text-lg text-foreground">
                        {fb.correctedVersionZh}
                      </div>
                    </div>
                    <p className="text-xs text-foreground">{fb.overallExplanationVi}</p>
                    <p className="text-xs text-muted-foreground">{fb.naturalnessFeedback}</p>
                    {Array.isArray(fb.grammarIssues) && fb.grammarIssues.length > 0 ? (
                      <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                        {fb.grammarIssues.map((iss, idx) => (
                          <li key={idx}>
                            • <strong>{iss.span}</strong> → {iss.suggestion}: {iss.explanationVi}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
