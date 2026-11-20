"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Download,
  Layers,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";
import { VoiceRecorderCompare } from "@/components/chinese/VoiceRecorderCompare";
import {
  HanziStrokeCanvas,
  type CharacterStrokeItem,
} from "@/components/chinese/HanziStrokeCanvas";
import {
  MouthPositionDiagram,
  type ArticulationType,
} from "@/components/foundation/visuals/MouthPositionDiagram";
import { TonePitchDiagram } from "@/components/foundation/visuals/TonePitchDiagram";
import { StrokeAnatomyStudio } from "@/components/foundation/visuals/StrokeAnatomyDiagram";
import { CharacterStructureDiagram } from "@/components/foundation/visuals/CharacterStructureDiagram";
import { RadicalBreakdownDiagram } from "@/components/foundation/visuals/RadicalBreakdownDiagram";
import { PinyinSyllableBuilder } from "@/components/foundation/visuals/PinyinSyllableBuilder";
import {
  GrammarComparisonTable,
  SentenceOrderDiagram,
} from "@/components/foundation/visuals/SentenceGrammarVisuals";
import { saveOfflineLessonBundle } from "@/modules/offline/idb-client";
import type { AdaptiveRemediationItem } from "@/modules/foundation/adaptive.service";
import { cn } from "@/lib/utils/cn";

export interface FoundationPayload {
  stageLabel: string;
  introWhatVi: string;
  introWhyVi: string;
  objectivesVi: string[];
  explanationBlocks: Array<{ headingVi: string; bodyVi: string }>;
  visualType: string;
  mouthTypes?: ArticulationType[];
  sentenceSlots?: Array<{ labelVi: string; zh: string; pinyin: string; colorClass: string }>;
  grammarCompareRows?: Array<{
    vietnameseVi: string;
    wrongZh: string;
    correctZh: string;
    correctPinyin: string;
    reasonVi: string;
  }>;
  sceneImages?: Array<{ src: string; captionVi: string }>;
  audioSamples?: Array<{ zh: string; pinyin: string; vi: string }>;
  guidedExample?: { titleVi: string; stepsVi: string[] };
  commonMistakesVi?: string[];
  summaryVi: string;
}

export interface FoundationLessonProps {
  lesson: {
    id: string;
    slug: string;
    titleVi: string;
    titleZh?: string | null;
    subtitleVi?: string | null;
    estimatedMinutes: number;
    status: string;
    payload: FoundationPayload;
    concept?: {
      id: string;
      code: string;
      titleVi: string;
      masteryScore: number;
      bookmarked: boolean;
    } | null;
    prevLesson?: { slug: string; titleVi: string } | null;
    nextLesson?: { slug: string; titleVi: string } | null;
    demoCharacters: Array<{
      hanzi: string;
      pinyin: string;
      meaningVi: string;
      mnemonicVi?: string | null;
      strokes: CharacterStrokeItem[];
    }>;
    exercise?: {
      id: string;
      titleVi: string;
      passingPercent: number;
      questions: Array<{
        id: string;
        questionType: string;
        promptVi?: string | null;
        promptZh?: string | null;
        promptPinyin?: string | null;
        metadata?: Record<string, unknown> | null;
        options: Array<{
          optionKey: string;
          labelZh?: string | null;
          labelPinyin?: string | null;
          labelVi?: string | null;
        }>;
      }>;
    } | null;
  };
  defaultShowPinyin: boolean;
  defaultShowTranslation: boolean;
}

const STEP_ANCHORS = [
  { id: "sec-intro", label: "A–B. Giới thiệu & Mục tiêu" },
  { id: "sec-explain", label: "C. Giải thích chi tiết" },
  { id: "sec-visual", label: "D–E. Minh họa & Âm thanh" },
  { id: "sec-guided", label: "F–G. Ví dụ & Thực hành" },
  { id: "sec-mistakes", label: "I–J. Lỗi sai & Tóm tắt" },
  { id: "sec-check", label: "H–K. Kiểm tra & Thích ứng" },
];

export function FoundationLessonPlayer({
  lesson,
  defaultShowPinyin,
  defaultShowTranslation,
}: FoundationLessonProps) {
  const router = useRouter();
  const [showPinyin, setShowPinyin] = useState(defaultShowPinyin);
  const [showTranslation, setShowTranslation] = useState(defaultShowTranslation);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [bookmarked, setBookmarked] = useState(lesson.concept?.bookmarked ?? false);
  const [answers, setAnswers] = useState<
    Record<string, { optionKey?: string; text?: string; orderedTokens?: string[] }>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    score: number;
    maxScore: number;
    accuracyPercent: number;
    passed: boolean;
    details: Array<{ questionId: string; isCorrect: boolean; explanationVi: string | null }>;
    adaptiveRemediation: AdaptiveRemediationItem[];
  } | null>(null);
  const [remediationChoice, setRemediationChoice] = useState<Record<string, number>>({});

  const p = lesson.payload;

  const toggleBookmark = async () => {
    if (!lesson.concept) return;
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const res = await fetch("/api/v1/foundation/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId: lesson.concept.id }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        next ? "Đã đánh dấu khái niệm khó để xem lại." : "Đã bỏ đánh dấu khái niệm."
      );
    } catch {
      setBookmarked(!next);
      toast.error("Không thể cập nhật đánh dấu.");
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      const res = await fetch("/api/v1/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "lesson", lessonId: lesson.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      toast.success(
        `Đã đồng bộ Flashcards (${json.data.createdCount} thẻ mới, bỏ qua ${json.data.skippedDuplicates} thẻ trùng).`
      );
    } catch {
      toast.error("Không thể tạo Flashcards từ bài này.");
    }
  };

  const handleDownloadOffline = async () => {
    try {
      const res = await fetch(`/api/v1/offline/lesson-bundle/${lesson.id}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      await saveOfflineLessonBundle(json.data);
      toast.success("Đã lưu bài học Nền tảng vào bộ nhớ Offline (IndexedDB).");
    } catch {
      toast.error("Không thể tải bài học ngoại tuyến.");
    }
  };

  const handleMarkCompletedWithoutQuiz = async () => {
    try {
      const res = await fetch(`/api/v1/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          completedSections: ["OBJECTIVES"],
          addTimeSeconds: 300,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Đã ghi nhận hoàn thành bài học Nền tảng!");
      router.refresh();
    } catch {
      toast.error("Không thể ghi nhận tiến độ.");
    }
  };

  const handleSubmitKnowledgeCheck = async () => {
    if (!lesson.exercise) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/exercises/${lesson.exercise.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: answers, timeSpentSeconds: 120 }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();

      setCheckResult({
        score: json.data.attempt.score,
        maxScore: json.data.attempt.maxScore,
        accuracyPercent: json.data.attempt.accuracyPercent,
        passed: json.data.attempt.passed,
        details: json.data.details ?? [],
        adaptiveRemediation: json.data.adaptiveRemediation ?? [],
      });

      if (json.data.attempt.passed) {
        toast.success(`Tuyệt vời! Bạn đạt ${json.data.attempt.accuracyPercent}% và đã nắm vững bài học.`);
      } else {
        toast.warning(
          `Đạt ${json.data.attempt.accuracyPercent}%. Bạn có thể xem lại giải thích và thử lại không bị phạt!`
        );
      }
      router.refresh();
    } catch {
      toast.error("Không thể chấm điểm bài kiểm tra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Study Controls */}
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 lg:flex-row lg:items-start">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/foundation"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Trung tâm Nền tảng từ Con số 0
            </Link>
            <Badge variant="default">{p.stageLabel}</Badge>
            {lesson.status === "COMPLETED" ? (
              <Badge variant="success">Đã hoàn thành</Badge>
            ) : null}
          </div>
          <h1 className="text-xl font-bold text-foreground">{lesson.titleVi}</h1>
          {lesson.titleZh ? (
            <p lang="zh-Hans" className="font-hanzi text-base text-primary">
              {lesson.titleZh}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={showPinyin ? "default" : "outline"}
            onClick={() => setShowPinyin((v) => !v)}
          >
            Pinyin: {showPinyin ? "Bật" : "Tắt"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showTranslation ? "default" : "outline"}
            onClick={() => setShowTranslation((v) => !v)}
          >
            Dịch Việt: {showTranslation ? "Bật" : "Tắt"}
          </Button>
          <select
            aria-label="Tốc độ âm thanh"
            value={audioSpeed}
            onChange={(e) => setAudioSpeed(Number(e.target.value))}
            className="h-8 rounded-md border border-border bg-surface px-2 text-xs font-medium"
          >
            <option value={0.75}>Âm thanh 0.75x (Chậm)</option>
            <option value={1.0}>Âm thanh 1.0x (Chuẩn)</option>
            <option value={1.25}>Âm thanh 1.25x (Nhanh)</option>
          </select>
          {lesson.concept ? (
            <Button
              type="button"
              size="sm"
              variant={bookmarked ? "default" : "outline"}
              onClick={toggleBookmark}
            >
              <Bookmark className="h-3.5 w-3.5" />
              {bookmarked ? "Đã đánh dấu khó" : "Đánh dấu khó"}
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={handleGenerateFlashcards}>
            <Layers className="h-3.5 w-3.5" />
            Flashcards
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleDownloadOffline}>
            <Download className="h-3.5 w-3.5" />
            Offline
          </Button>
        </div>
      </div>

      {/* Persistent Left Lesson Nav + Main Reading Column */}
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                  Cấu trúc bài học (A → M)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-3 pt-0">
                {STEP_ANCHORS.map((step) => (
                  <a
                    key={step.id}
                    href={`#${step.id}`}
                    className="block rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  >
                    {step.label}
                  </a>
                ))}
              </CardContent>
            </Card>

            {lesson.concept ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">
                    Mức độ nắm vững khái niệm
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-foreground">
                    {lesson.concept.titleVi}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Mastery</span>
                    <span className="font-semibold">{lesson.concept.masteryScore}%</span>
                  </div>
                  <Progress value={lesson.concept.masteryScore} />
                </CardContent>
              </Card>
            ) : null}

            <div className="flex flex-col gap-2">
              {lesson.prevLesson ? (
                <Button size="sm" variant="outline" className="justify-start text-xs" asChild>
                  <Link href={`/lessons/${lesson.prevLesson.slug}`}>
                    <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Bài trước</span>
                  </Link>
                </Button>
              ) : null}
              {lesson.nextLesson ? (
                <Button size="sm" variant="outline" className="justify-between text-xs" asChild>
                  <Link href={`/lessons/${lesson.nextLesson.slug}`}>
                    <span className="truncate">Bài tiếp theo</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </aside>

        {/* Main 13-part Beginner Content Flow */}
        <div className="space-y-6 lg:col-span-9">
          {/* A & B: Introduction & Objectives */}
          <Card id="sec-intro">
            <CardHeader>
              <CardTitle className="text-base">A–B. Hôm nay học gì & Vì sao quan trọng?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-border bg-background p-3">
                  <div className="text-xs font-semibold text-primary">Bạn đang học gì?</div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground">{p.introWhatVi}</p>
                </div>
                <div className="rounded-md border border-border bg-background p-3">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Vì sao cần học khái niệm này?
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground">{p.introWhyVi}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mục tiêu đạt được sau bài ({lesson.estimatedMinutes} phút):
                </div>
                <ul className="space-y-1.5 text-xs text-foreground">
                  {p.objectivesVi.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* C: Detailed Vietnamese Explanation */}
          <Card id="sec-explain">
            <CardHeader>
              <CardTitle className="text-base">C. Giải thích chi tiết bằng tiếng Việt</CardTitle>
              <CardDescription>
                Học từng ý một, hiểu bản chất trước khi luyện tập. Bạn có thể đọc lại bao nhiêu lần tùy thích.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {p.explanationBlocks.map((block, idx) => (
                <div
                  key={idx}
                  className="space-y-1.5 rounded-md border border-border bg-background p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">{block.headingVi}</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {block.bodyVi}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* D & E: Visual Illustration & Audio Demonstration */}
          <Card id="sec-visual">
            <CardHeader>
              <CardTitle className="text-base">D–E. Minh họa Trực quan & Âm thanh mẫu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {p.visualType === "MOUTH_CONTRAST" && p.mouthTypes?.length ? (
                <div className="space-y-3">
                  {p.mouthTypes.map((mt) => (
                    <MouthPositionDiagram key={mt} type={mt} />
                  ))}
                </div>
              ) : null}

              {p.visualType === "TONE_PITCH" ? (
                <TonePitchDiagram speed={audioSpeed} />
              ) : null}

              {p.visualType === "SYLLABLE_BUILDER" ? <PinyinSyllableBuilder /> : null}

              {p.visualType === "STROKE_ANATOMY" ? <StrokeAnatomyStudio /> : null}

              {p.visualType === "CHAR_STRUCTURES" ? <CharacterStructureDiagram /> : null}

              {p.visualType === "CHAR_STROKE_DEMO" && lesson.demoCharacters.length > 0 ? (
                <div className="space-y-4">
                  {lesson.demoCharacters.map((ch) => (
                    <HanziStrokeCanvas
                      key={ch.hanzi}
                      hanzi={ch.hanzi}
                      pinyin={ch.pinyin}
                      meaningVi={ch.meaningVi}
                      mnemonicVi={ch.mnemonicVi}
                      strokes={ch.strokes}
                    />
                  ))}
                </div>
              ) : null}

              {p.visualType === "RADICAL_BREAKDOWN" ? <RadicalBreakdownDiagram /> : null}

              {p.visualType === "SENTENCE_ORDER" && p.sentenceSlots?.length ? (
                <SentenceOrderDiagram slots={p.sentenceSlots} />
              ) : null}

              {p.visualType === "GRAMMAR_COMPARE" && p.grammarCompareRows?.length ? (
                <GrammarComparisonTable rows={p.grammarCompareRows} />
              ) : null}

              {p.visualType === "VOCAB_SCENES" && p.sceneImages?.length ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {p.sceneImages.map((img) => (
                    <figure
                      key={img.src}
                      className="overflow-hidden rounded-lg border border-border bg-background"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.captionVi} className="w-full" />
                      <figcaption className="border-t border-border p-2.5 text-xs font-medium text-foreground">
                        {img.captionVi}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}

              {/* Audio Samples List */}
              {p.audioSamples?.length ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nghe phát âm mẫu (chỉnh tốc độ ở thanh trên):
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {p.audioSamples.map((sample, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-3"
                      >
                        <div>
                          <div lang="zh-Hans" className="font-hanzi text-xl font-bold text-foreground">
                            {sample.zh}
                          </div>
                          {showPinyin ? (
                            <div className="font-pinyin text-xs font-medium text-primary">
                              {sample.pinyin}
                            </div>
                          ) : null}
                          {showTranslation ? (
                            <div className="text-xs text-muted-foreground">{sample.vi}</div>
                          ) : null}
                        </div>
                        <ChineseAudioPlayer
                          textZh={sample.zh}
                          defaultSpeed={audioSpeed}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* F & G: Guided Example & Step-by-Step Practice */}
          {p.guidedExample ? (
            <Card id="sec-guided">
              <CardHeader>
                <CardTitle className="text-base">F–G. Ví dụ có hướng dẫn & Thực hành từng bước</CardTitle>
                <CardDescription>{p.guidedExample.titleVi}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-2 text-sm text-foreground">
                  {p.guidedExample.stepsVi.map((step, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-border bg-background px-3.5 py-2.5 text-xs leading-relaxed"
                    >
                      {step}
                    </li>
                  ))}
                </ol>

                {p.audioSamples?.[0] &&
                (p.visualType === "TONE_PITCH" || p.visualType === "MOUTH_CONTRAST") ? (
                  <VoiceRecorderCompare
                    targetTextZh={p.audioSamples.slice(0, 4).map((s) => s.zh).join(" ")}
                    targetPinyin={p.audioSamples.slice(0, 4).map((s) => s.pinyin).join(" · ")}
                    meaningVi="Ghi âm đọc theo các âm mẫu vừa nghe và tự đối chiếu trực tiếp (không bị trừ điểm khi lặp lại)."
                  />
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {/* I & J: Common Mistakes & Summary */}
          <Card id="sec-mistakes">
            <CardHeader>
              <CardTitle className="text-base">I–J. Lỗi thường gặp của người Việt & Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {p.commonMistakesVi?.length ? (
                <div className="space-y-1.5 rounded-md border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Những lỗi cần tránh:</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc">
                    {p.commonMistakesVi.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-md border border-border bg-background p-3.5 text-xs leading-relaxed text-foreground">
                <strong>Tóm tắt nhanh 30 giây:</strong> {p.summaryVi}
              </div>
            </CardContent>
          </Card>

          {/* H, K, L, M: Knowledge Check + Adaptive Remediation */}
          <Card id="sec-check">
            <CardHeader>
              <CardTitle className="text-base">
                H–K. {lesson.exercise?.titleVi ?? "Kiểm tra hiểu biết & Ghi nhận tiến độ"}
              </CardTitle>
              <CardDescription>
                Không tự động nhảy bài khi chưa nắm vững. Bạn được làm lại miễn phí không giới hạn để thật sự hiểu bản chất.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!lesson.exercise ? (
                <Button type="button" onClick={handleMarkCompletedWithoutQuiz}>
                  <CheckCircle2 className="h-4 w-4" />
                  Đánh dấu đã hiểu và hoàn thành bài học này
                </Button>
              ) : (
                <>
                  {lesson.exercise.questions.map((q, qIdx) => {
                    const currentAns = answers[q.id] ?? {};
                    const graded = checkResult?.details.find((d) => d.questionId === q.id);
                    const tokens = Array.isArray(q.metadata?.tokens)
                      ? (q.metadata.tokens as string[])
                      : [];

                    return (
                      <div
                        key={q.id}
                        className="space-y-3 rounded-md border border-border bg-background p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Câu {qIdx + 1} • {q.questionType}
                          </span>
                          {graded ? (
                            <Badge variant={graded.isCorrect ? "success" : "destructive"}>
                              {graded.isCorrect ? "Chính xác" : "Cần xem lại"}
                            </Badge>
                          ) : null}
                        </div>

                        {q.promptVi ? (
                          <p className="text-sm font-medium text-foreground">{q.promptVi}</p>
                        ) : null}

                        {q.questionType === "AUDIO_DISCRIMINATION" && q.promptZh ? (
                          <ChineseAudioPlayer
                            textZh={q.promptZh}
                            defaultSpeed={audioSpeed}
                          />
                        ) : null}

                        {q.options.length > 0 ? (
                          <div className="space-y-1.5">
                            {q.options.map((opt) => {
                              const selected = currentAns.optionKey === opt.optionKey;
                              return (
                                <button
                                  key={opt.optionKey}
                                  type="button"
                                  onClick={() =>
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: { optionKey: opt.optionKey },
                                    }))
                                  }
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm cursor-pointer",
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
                                  {showPinyin && opt.labelPinyin ? (
                                    <span className="font-pinyin text-xs text-primary">
                                      ({opt.labelPinyin})
                                    </span>
                                  ) : null}
                                  {opt.labelVi ? <span>{opt.labelVi}</span> : null}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}

                        {q.questionType === "SYLLABLE_BUILDER" ? (
                          <input
                            type="text"
                            value={currentAns.text ?? ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: { text: e.target.value },
                              }))
                            }
                            placeholder="Nhập Pinyin có dấu (VD: mǎ hoặc ma3)..."
                            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                          />
                        ) : null}

                        {(q.questionType === "STROKE_ORDER_SEQUENCE" ||
                          q.questionType === "SENTENCE_ORDERING") &&
                        tokens.length > 0 ? (
                          <div className="space-y-2">
                            <div className="min-h-10 rounded-md border border-dashed border-border bg-surface p-2">
                              {(currentAns.orderedTokens ?? []).length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {(currentAns.orderedTokens ?? []).map((tok, tIdx) => (
                                    <button
                                      key={`${tok}-${tIdx}`}
                                      type="button"
                                      onClick={() =>
                                        setAnswers((prev) => ({
                                          ...prev,
                                          [q.id]: {
                                            orderedTokens: (
                                              prev[q.id]?.orderedTokens ?? []
                                            ).filter((_, i) => i !== tIdx),
                                          },
                                        }))
                                      }
                                      className="rounded border border-primary bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground cursor-pointer"
                                    >
                                      {tIdx + 1}. {tok}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Bấm lần lượt các khối bên dưới theo đúng thứ tự...
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
                                      setAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: {
                                          orderedTokens: [
                                            ...(prev[q.id]?.orderedTokens ?? []),
                                            tok,
                                          ],
                                        },
                                      }))
                                    }
                                    className="rounded-md border border-border bg-surface px-3 py-1 text-xs hover:bg-surface-muted disabled:opacity-40 cursor-pointer"
                                  >
                                    {tok}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}

                        {graded?.explanationVi ? (
                          <p className="rounded bg-surface-muted px-3 py-2 text-xs text-foreground">
                            <strong>Giải thích:</strong> {graded.explanationVi}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitKnowledgeCheck}
                    >
                      {submitting ? "Đang chấm điểm..." : "Kiểm tra kết quả"}
                    </Button>
                    {checkResult ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAnswers({});
                          setCheckResult(null);
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Làm lại không bị phạt
                      </Button>
                    ) : null}
                  </div>

                  {checkResult ? (
                    <div
                      className={cn(
                        "rounded-md border p-4 text-sm",
                        checkResult.passed
                          ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                          : "border-amber-300 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30"
                      )}
                    >
                      <div className="font-semibold text-foreground">
                        Kết quả: {checkResult.score}/{checkResult.maxScore} điểm (
                        {checkResult.accuracyPercent}%) —{" "}
                        {checkResult.passed
                          ? "Đạt yêu cầu! Bạn đã sẵn sàng học bài tiếp theo."
                          : "Chưa đạt ngưỡng 80%. Hãy xem lại giải thích hoặc phần hỗ trợ thích ứng bên dưới trước khi đi tiếp."}
                      </div>
                      {checkResult.passed && lesson.nextLesson ? (
                        <Button size="sm" className="mt-3" asChild>
                          <Link href={`/lessons/${lesson.nextLesson.slug}`}>
                            Chuyển sang {lesson.nextLesson.titleVi}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Adaptive Learning Remediation Panel */}
                  {checkResult && checkResult.adaptiveRemediation.length > 0 ? (
                    <div className="space-y-3 rounded-lg border border-primary/40 bg-accent/40 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Lightbulb className="h-4 w-4" />
                        <span>Hỗ trợ học thích ứng (Phát hiện nhầm lặp lại)</span>
                      </div>
                      {checkResult.adaptiveRemediation.map((rem) => {
                        const chosen = remediationChoice[rem.conceptId];
                        return (
                          <div
                            key={rem.conceptId}
                            className="space-y-2.5 rounded-md border border-border bg-surface p-3.5 text-xs"
                          >
                            <div className="font-semibold text-foreground">
                              Khái niệm cần củng cố: {rem.titleVi}
                            </div>
                            <p className="text-muted-foreground">
                              <strong>Giải thích đơn giản hóa:</strong> {rem.simpleExplanationVi}
                            </p>
                            {rem.extraExamples.length > 0 ? (
                              <div className="space-y-1 rounded bg-background p-2.5">
                                <div className="font-semibold text-muted-foreground">
                                  Ví dụ bổ sung dễ nhớ:
                                </div>
                                {rem.extraExamples.map((ex, idx) => (
                                  <div key={idx}>
                                    <span lang="zh-Hans" className="font-hanzi text-sm font-bold">
                                      {ex.zh}
                                    </span>{" "}
                                    {ex.pinyin ? (
                                      <span className="font-pinyin text-primary">({ex.pinyin})</span>
                                    ) : null}{" "}
                                    — {ex.vi}
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            {rem.remediationQuestion ? (
                              <div className="space-y-1.5 rounded border border-border bg-background p-2.5">
                                <div className="font-medium text-foreground">
                                  {rem.remediationQuestion.promptVi}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {rem.remediationQuestion.options.map((opt, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() =>
                                        setRemediationChoice((prev) => ({
                                          ...prev,
                                          [rem.conceptId]: idx,
                                        }))
                                      }
                                      className={cn(
                                        "rounded border px-2.5 py-1 text-xs cursor-pointer",
                                        chosen === idx
                                          ? idx === rem.remediationQuestion?.correctIndex
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                            : "border-red-500 bg-red-50 text-red-900"
                                          : "border-border bg-surface hover:bg-surface-muted"
                                      )}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                                {chosen !== undefined ? (
                                  <p className="text-[11px] text-muted-foreground">
                                    {rem.remediationQuestion.explanationVi}
                                  </p>
                                ) : null}
                              </div>
                            ) : null}

                            {rem.prerequisiteLesson ? (
                              <Link
                                href={`/lessons/${rem.prerequisiteLesson.slug}`}
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                              >
                                Xem lại bài kiến thức nền: {rem.prerequisiteLesson.titleVi} →
                              </Link>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
