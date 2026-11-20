"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FastForward,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";
import {
  HanziStrokeCanvas,
  type CharacterStrokeItem,
} from "@/components/chinese/HanziStrokeCanvas";
import { VoiceRecorderCompare } from "@/components/chinese/VoiceRecorderCompare";
import {
  enqueueOfflineMutation,
  saveOfflineLessonBundle,
} from "@/modules/offline/idb-client";
import { cn } from "@/lib/utils/cn";

export interface LessonPlayerData {
  id: string;
  slug: string;
  titleVi: string;
  titleZh?: string | null;
  subtitleVi?: string | null;
  courseTitleVi: string;
  courseSlug: string;
  estimatedMinutes: number;
  isSkippable: boolean;
  objectivesVi: string[];
  completedSections: string[];
  status: string;
  sections: Array<{
    id: string;
    sectionType: string;
    titleVi: string;
    contentPayload: Record<string, unknown>;
  }>;
  vocabulary: Array<{
    id: string;
    simplified: string;
    traditional?: string | null;
    pinyin: string;
    partOfSpeech?: string | null;
    primaryMeaningVi: string;
    primaryMeaningEn?: string | null;
    commonMistakesVi?: string | null;
    examples: Array<{ sentenceZh: string; pinyin: string; translationVi: string }>;
  }>;
  grammar: Array<{
    id: string;
    titleVi: string;
    patternZh: string;
    patternPinyin?: string | null;
    explanationVi: string;
    usageNotesVi?: string | null;
    comparisonsVi?: string | null;
    commonErrorsVi?: string | null;
    examples: Array<{
      sentenceZh: string;
      pinyin: string;
      translationVi: string;
      isIncorrect: boolean;
    }>;
  }>;
  characters: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
    mnemonicVi?: string | null;
    strokes: CharacterStrokeItem[];
  }>;
  exercises: Array<{
    id: string;
    titleVi: string;
    passingPercent: number;
    questions: Array<{
      id: string;
      questionType: string;
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
    }>;
  }>;
}

const SECTION_SHORT_LABELS: Record<string, string> = {
  OBJECTIVES: "1. Mục tiêu",
  VOCABULARY: "2. Từ vựng",
  GRAMMAR: "3. Ngữ pháp",
  LISTENING: "4. Nghe",
  SPEAKING: "5. Nói",
  READING: "6. Đọc",
  WRITING: "7. Viết",
  ASSESSMENT: "8. Kiểm tra",
};

export function LessonPlayer({
  lesson,
  defaultShowPinyin,
  defaultShowTranslation,
}: {
  lesson: LessonPlayerData;
  defaultShowPinyin: boolean;
  defaultShowTranslation: boolean;
}) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPinyin, setShowPinyin] = useState(defaultShowPinyin);
  const [showTranslation, setShowTranslation] = useState(defaultShowTranslation);
  const [completedSections, setCompletedSections] = useState<string[]>(
    lesson.completedSections
  );
  const [downloadingOffline, setDownloadingOffline] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);

  // Listening quick comprehension state
  const [listeningChoice, setListeningChoice] = useState<number | null>(null);

  // Assessment Exercise state
  const [answers, setAnswers] = useState<
    Record<string, { optionKey?: string; text?: string; orderedTokens?: string[] }>
  >({});
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [exerciseResult, setExerciseResult] = useState<{
    score: number;
    maxScore: number;
    accuracyPercent: number;
    passed: boolean;
    generatedFlashcards: number;
    details: Array<{
      questionId: string;
      isCorrect: boolean;
      explanationVi: string | null;
    }>;
  } | null>(null);

  const activeSection = lesson.sections[activeIndex];
  const progressPercent = Math.round(
    (completedSections.length / Math.max(1, lesson.sections.length)) * 100
  );

  const markSectionDone = async (sectionType: string) => {
    const next = Array.from(new Set([...completedSections, sectionType]));
    setCompletedSections(next);

    try {
      if (!navigator.onLine) {
        await enqueueOfflineMutation({
          entityType: "lesson_progress",
          operationType: "MARK_SECTION",
          payload: { lessonId: lesson.id, completedSections: [sectionType], addTimeSeconds: 60 },
        });
        toast.info("Đã lưu tiến độ vào hàng đợi ngoại tuyến.");
      } else {
        await fetch(`/api/v1/lessons/${lesson.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completedSections: [sectionType], addTimeSeconds: 60 }),
        });
      }
      if (activeIndex < lesson.sections.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else {
        toast.success("Bạn đã hoàn tất các phần học của bài này!");
        router.refresh();
      }
    } catch {
      toast.error("Không thể cập nhật tiến độ bài học.");
    }
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingCards(true);
    try {
      const res = await fetch("/api/v1/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "lesson", lessonId: lesson.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      toast.success(
        `Đã tạo ${json.data.createdCount} thẻ Flashcard mới (bỏ qua ${json.data.skippedDuplicates} thẻ đã tồn tại).`
      );
    } catch {
      toast.error("Không thể tạo Flashcard từ bài học.");
    } finally {
      setGeneratingCards(false);
    }
  };

  const handleDownloadOffline = async () => {
    setDownloadingOffline(true);
    try {
      const res = await fetch(`/api/v1/offline/lesson-bundle/${lesson.id}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      await saveOfflineLessonBundle(json.data);
      toast.success("Đã tải bài học về bộ nhớ Offline (IndexedDB).");
    } catch {
      toast.error("Không thể tải bài học ngoại tuyến.");
    } finally {
      setDownloadingOffline(false);
    }
  };

  const handleSkipMastered = async () => {
    try {
      const res = await fetch(`/api/v1/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          completedSections: lesson.sections.map((s) => s.sectionType),
          skippedViaTest: true,
        }),
      });
      if (!res.ok) throw new Error();
      setCompletedSections(lesson.sections.map((s) => s.sectionType));
      toast.success("Đã đánh dấu hoàn thành bài học theo chế độ bỏ qua nội dung đã nắm vững.");
      router.refresh();
    } catch {
      toast.error("Không thể bỏ qua bài học.");
    }
  };

  const handleSubmitExercise = async (exerciseId: string) => {
    setSubmittingExercise(true);
    try {
      const res = await fetch(`/api/v1/exercises/${exerciseId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: answers,
          timeSpentSeconds: 120,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();

      setExerciseResult({
        score: json.data.attempt.score,
        maxScore: json.data.attempt.maxScore,
        accuracyPercent: json.data.attempt.accuracyPercent,
        passed: json.data.attempt.passed,
        generatedFlashcards: json.data.generatedFlashcards ?? 0,
        details: json.data.details ?? [],
      });

      if (json.data.attempt.passed) {
        setCompletedSections((prev) => Array.from(new Set([...prev, "ASSESSMENT"])));
        toast.success(`Chúc mừng! Bạn đạt ${json.data.attempt.accuracyPercent}%.`);
      } else {
        toast.warning(
          `Đạt ${json.data.attempt.accuracyPercent}%. Hệ thống đã tạo ${json.data.generatedFlashcards} thẻ Flashcard từ các câu sai.`
        );
      }
      router.refresh();
    } catch {
      toast.error("Không thể chấm điểm bài tập. Vui lòng thử lại.");
    } finally {
      setSubmittingExercise(false);
    }
  };

  const listeningPayload = activeSection?.contentPayload as {
    dialogueTitleVi?: string;
    lines?: Array<{ speaker: string; zh: string; pinyin: string; vi: string }>;
    comprehensionQuestion?: { promptVi: string; options: string[]; correctIndex: number };
  };

  const speakingPayload = activeSection?.contentPayload as {
    prompts?: Array<{ zh: string; pinyin: string; vi: string }>;
  };

  const readingPayload = activeSection?.contentPayload as {
    titleVi?: string;
    passageZh?: string;
    passagePinyin?: string;
    translationVi?: string;
    highlightedWords?: string[];
  };

  const writingPayload = activeSection?.contentPayload as {
    promptVi?: string;
    sampleZh?: string;
  };

  const primaryExercise = lesson.exercises[0];

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 lg:flex-row lg:items-center">
        <div className="space-y-1">
          <Link
            href={`/courses/${lesson.courseSlug}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {lesson.courseTitleVi}
          </Link>
          <h1 className="text-xl font-bold text-foreground">{lesson.titleVi}</h1>
          {lesson.titleZh ? (
            <p lang="zh-Hans" className="font-hanzi text-base text-primary">
              {lesson.titleZh}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={generatingCards}
            onClick={handleGenerateFlashcards}
          >
            <Layers className="h-3.5 w-3.5" />
            {generatingCards ? "Đang tạo..." : "+ Flashcard bài học"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={downloadingOffline}
            onClick={handleDownloadOffline}
          >
            <Download className="h-3.5 w-3.5" />
            {downloadingOffline ? "Đang tải..." : "Tải Offline"}
          </Button>
        </div>
      </div>

      {/* Progress & 8-Section Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Tiến độ bài học: {completedSections.length}/{lesson.sections.length} mục ({progressPercent}%)
          </span>
          {lesson.isSkippable && progressPercent < 100 ? (
            <button
              type="button"
              onClick={handleSkipMastered}
              className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
            >
              <FastForward className="h-3.5 w-3.5" />
              Đã nắm vững? Đánh dấu hoàn thành
            </button>
          ) : null}
        </div>
        <Progress value={progressPercent} />

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {lesson.sections.map((sec, idx) => {
            const done = completedSections.includes(sec.sectionType);
            const active = idx === activeIndex;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                )}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : null}
                <span>{SECTION_SHORT_LABELS[sec.sectionType] ?? sec.titleVi}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content + Quick Study Sidebar */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {activeSection?.sectionType === "OBJECTIVES" ? (
            <Card>
              <CardHeader>
                <CardTitle>Mục tiêu đạt được sau bài học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-foreground">
                  {lesson.objectivesVi.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                  Thời lượng dự kiến: khoảng {lesson.estimatedMinutes} phút. Hãy học lần lượt từng mục để hệ thống ghi nhận đầy đủ tiến độ.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {activeSection?.sectionType === "VOCABULARY" ? (
            <div className="space-y-3">
              {lesson.vocabulary.map((v) => (
                <Card key={v.id}>
                  <CardContent className="space-y-2.5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-baseline gap-2.5">
                        <span lang="zh-Hans" className="font-hanzi text-2xl font-bold text-foreground">
                          {v.simplified}
                        </span>
                        {showPinyin ? (
                          <span className="font-pinyin text-sm font-medium text-primary">
                            {v.pinyin}
                          </span>
                        ) : null}
                        {v.partOfSpeech ? (
                          <Badge variant="outline">{v.partOfSpeech}</Badge>
                        ) : null}
                      </div>
                      <ChineseAudioPlayer textZh={v.simplified} compact />
                    </div>

                    {showTranslation ? (
                      <p className="text-sm font-medium text-foreground">
                        {v.primaryMeaningVi}
                        {v.primaryMeaningEn ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            ({v.primaryMeaningEn})
                          </span>
                        ) : null}
                      </p>
                    ) : null}

                    {v.examples[0] ? (
                      <div className="rounded-md border border-border bg-background p-3 text-sm">
                        <div lang="zh-Hans" className="font-hanzi text-base text-foreground">
                          {v.examples[0].sentenceZh}
                        </div>
                        {showPinyin ? (
                          <div className="font-pinyin text-xs text-primary">
                            {v.examples[0].pinyin}
                          </div>
                        ) : null}
                        {showTranslation ? (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {v.examples[0].translationVi}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {v.commonMistakesVi ? (
                      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                        <strong>Lỗi thường gặp:</strong> {v.commonMistakesVi}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {activeSection?.sectionType === "GRAMMAR" ? (
            <div className="space-y-4">
              {lesson.grammar.length === 0 ? (
                <Card>
                  <CardContent className="p-5 text-sm text-muted-foreground">
                    Bài nền tảng này tập trung vào phát âm thanh điệu và bút thuận chữ Hán. Các mẫu câu ngữ pháp trọng tâm sẽ bắt đầu từ HSK 1 Bài 1.
                  </CardContent>
                </Card>
              ) : (
                lesson.grammar.map((g) => (
                  <Card key={g.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{g.titleVi}</CardTitle>
                      <div className="mt-1 rounded-md border border-border bg-background px-3 py-2">
                        <div lang="zh-Hans" className="font-hanzi text-lg font-semibold text-primary">
                          {g.patternZh}
                        </div>
                        {showPinyin && g.patternPinyin ? (
                          <div className="font-pinyin text-xs text-muted-foreground">
                            {g.patternPinyin}
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p className="text-foreground">{g.explanationVi}</p>
                      {g.usageNotesVi ? (
                        <p className="text-xs text-muted-foreground">
                          <strong>Cách dùng:</strong> {g.usageNotesVi}
                        </p>
                      ) : null}
                      {g.comparisonsVi ? (
                        <p className="text-xs text-muted-foreground">
                          <strong>So sánh với tiếng Việt:</strong> {g.comparisonsVi}
                        </p>
                      ) : null}
                      {g.commonErrorsVi ? (
                        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">
                          <strong>Tránh nhầm lẫn:</strong> {g.commonErrorsVi}
                        </p>
                      ) : null}
                      <div className="space-y-2 pt-1">
                        {g.examples.map((ex, i) => (
                          <div
                            key={i}
                            className={cn(
                              "rounded-md border p-3",
                              ex.isIncorrect
                                ? "border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20"
                                : "border-border bg-background"
                            )}
                          >
                            <div lang="zh-Hans" className="font-hanzi text-base">
                              {ex.isIncorrect ? "✗ " : "✓ "}
                              {ex.sentenceZh}
                            </div>
                            {showPinyin ? (
                              <div className="font-pinyin text-xs text-primary">{ex.pinyin}</div>
                            ) : null}
                            {showTranslation ? (
                              <div className="text-xs text-muted-foreground">
                                {ex.translationVi}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : null}

          {activeSection?.sectionType === "LISTENING" ? (
            <Card>
              <CardHeader>
                <CardTitle>{listeningPayload?.dialogueTitleVi ?? "Luyện Nghe hội thoại"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {listeningPayload?.lines ? (
                  <>
                    <ChineseAudioPlayer
                      textZh={listeningPayload.lines.map((l) => l.zh).join(" ")}
                    />
                    <div className="space-y-3">
                      {listeningPayload.lines.map((line, i) => (
                        <div
                          key={i}
                          className="rounded-md border border-border bg-background p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {line.speaker}
                            </span>
                            <ChineseAudioPlayer textZh={line.zh} compact />
                          </div>
                          <div lang="zh-Hans" className="font-hanzi mt-1 text-lg text-foreground">
                            {line.zh}
                          </div>
                          {showPinyin ? (
                            <div className="font-pinyin text-xs text-primary">{line.pinyin}</div>
                          ) : null}
                          {showTranslation ? (
                            <div className="mt-1 text-xs text-muted-foreground">{line.vi}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {listeningPayload?.comprehensionQuestion ? (
                  <div className="space-y-2 rounded-md border border-border bg-surface-muted/40 p-4">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">
                      Kiểm tra nghe hiểu nhanh
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {listeningPayload.comprehensionQuestion.promptVi}
                    </p>
                    <div className="space-y-1.5">
                      {listeningPayload.comprehensionQuestion.options.map((opt, idx) => {
                        const selected = listeningChoice === idx;
                        const isCorrect =
                          idx === listeningPayload.comprehensionQuestion?.correctIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setListeningChoice(idx)}
                            className={cn(
                              "block w-full rounded-md border px-3 py-2 text-left text-xs transition-colors cursor-pointer",
                              selected
                                ? isCorrect
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                                  : "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-200"
                                : "border-border bg-surface hover:bg-surface-muted"
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {activeSection?.sectionType === "SPEAKING" ? (
            <div className="space-y-4">
              {(speakingPayload?.prompts ?? []).map((item, idx) => (
                <VoiceRecorderCompare
                  key={idx}
                  targetTextZh={item.zh}
                  targetPinyin={item.pinyin}
                  meaningVi={showTranslation ? item.vi : undefined}
                />
              ))}
            </div>
          ) : null}

          {activeSection?.sectionType === "READING" ? (
            <Card>
              <CardHeader>
                <CardTitle>{readingPayload?.titleVi ?? "Đọc hiểu văn bản"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {readingPayload?.passageZh ? (
                  <>
                    <ChineseAudioPlayer textZh={readingPayload.passageZh} />
                    <div
                      lang="zh-Hans"
                      className="font-hanzi rounded-md border border-border bg-background p-5 text-xl leading-loose text-foreground"
                    >
                      {readingPayload.passageZh}
                    </div>
                    {showPinyin && readingPayload.passagePinyin ? (
                      <p className="font-pinyin text-sm leading-relaxed text-primary">
                        {readingPayload.passagePinyin}
                      </p>
                    ) : null}
                    {showTranslation && readingPayload.translationVi ? (
                      <div className="rounded-md border border-border bg-surface-muted/40 p-4 text-sm text-foreground">
                        <div className="mb-1 text-xs font-semibold text-muted-foreground">
                          Bản dịch tham khảo
                        </div>
                        {readingPayload.translationVi}
                      </div>
                    ) : null}
                    {readingPayload.highlightedWords?.length ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Từ khóa trọng tâm:</span>
                        {readingPayload.highlightedWords.map((w) => (
                          <Badge key={w} variant="default" className="font-hanzi">
                            {w}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {activeSection?.sectionType === "WRITING" ? (
            <div className="space-y-4">
              {lesson.characters.map((ch) => (
                <HanziStrokeCanvas
                  key={ch.hanzi}
                  hanzi={ch.hanzi}
                  pinyin={ch.pinyin}
                  meaningVi={ch.meaningVi}
                  mnemonicVi={ch.mnemonicVi}
                  strokes={ch.strokes}
                />
              ))}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thực hành viết câu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-foreground">{writingPayload?.promptVi}</p>
                  {writingPayload?.sampleZh ? (
                    <p className="rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
                      Gợi ý mẫu:{" "}
                      <span lang="zh-Hans" className="font-hanzi text-base text-foreground">
                        {writingPayload.sampleZh}
                      </span>
                    </p>
                  ) : null}
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/practice/writing">Mở không gian Luyện Viết & Chấm bài</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeSection?.sectionType === "ASSESSMENT" ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {primaryExercise?.titleVi ?? "Kiểm tra đánh giá cuối bài"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {!primaryExercise ? (
                  <p className="text-sm text-muted-foreground">
                    Bài học này chưa gắn bộ câu hỏi kiểm tra. Bạn có thể đánh dấu hoàn thành bên dưới.
                  </p>
                ) : (
                  <>
                    {primaryExercise.questions.map((q, qIdx) => {
                      const currentAns = answers[q.id] ?? {};
                      const gradedDetail = exerciseResult?.details.find(
                        (d) => d.questionId === q.id
                      );
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
                            {gradedDetail ? (
                              <Badge variant={gradedDetail.isCorrect ? "success" : "destructive"}>
                                {gradedDetail.isCorrect ? "Chính xác" : "Chưa đúng"}
                              </Badge>
                            ) : null}
                          </div>

                          {q.promptVi ? (
                            <p className="text-sm font-medium text-foreground">{q.promptVi}</p>
                          ) : null}
                          {q.passageZh ? (
                            <p lang="zh-Hans" className="font-hanzi rounded bg-surface p-3 text-base">
                              {q.passageZh}
                            </p>
                          ) : null}
                          {q.promptZh ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span lang="zh-Hans" className="font-hanzi text-lg font-semibold">
                                {q.promptZh}
                              </span>
                              {q.questionType === "LISTENING_COMPREHENSION" ? (
                                <ChineseAudioPlayer textZh={q.promptZh} compact />
                              ) : null}
                            </div>
                          ) : null}

                          {/* Multiple Choice / Listening */}
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
                                      "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                                      selected
                                        ? "border-primary bg-accent text-accent-foreground font-medium"
                                        : "border-border bg-surface hover:bg-surface-muted"
                                    )}
                                  >
                                    <span className="font-semibold">{opt.optionKey}.</span>
                                    {opt.labelZh ? (
                                      <span lang="zh-Hans" className="font-hanzi text-base">
                                        {opt.labelZh}
                                      </span>
                                    ) : null}
                                    {showPinyin && opt.labelPinyin ? (
                                      <span className="font-pinyin text-xs text-muted-foreground">
                                        ({opt.labelPinyin})
                                      </span>
                                    ) : null}
                                    {opt.labelVi ? <span>{opt.labelVi}</span> : null}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}

                          {/* Fill in the blank / Translation */}
                          {q.questionType === "FILL_IN_BLANK" ||
                          q.questionType === "TRANSLATION" ? (
                            <input
                              type="text"
                              value={currentAns.text ?? ""}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: { text: e.target.value },
                                }))
                              }
                              placeholder="Nhập đáp án tiếng Trung..."
                              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                            />
                          ) : null}

                          {/* Sentence Ordering */}
                          {q.questionType === "SENTENCE_ORDERING" && tokens.length > 0 ? (
                            <div className="space-y-2">
                              <div className="min-h-10 rounded-md border border-dashed border-border bg-surface p-2 font-hanzi text-base">
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
                                        className="rounded border border-primary bg-accent px-2.5 py-1 text-sm text-accent-foreground cursor-pointer"
                                      >
                                        {tok}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="font-sans text-xs text-muted-foreground">
                                    Bấm lần lượt các từ bên dưới để xếp thành câu đúng...
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
                                      className="font-hanzi rounded-md border border-border bg-surface px-3 py-1 text-sm hover:bg-surface-muted disabled:opacity-40 cursor-pointer"
                                    >
                                      {tok}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {gradedDetail?.explanationVi ? (
                            <p className="rounded bg-surface-muted px-3 py-2 text-xs text-foreground">
                              <strong>Giải thích:</strong> {gradedDetail.explanationVi}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}

                    {exerciseResult ? (
                      <div className="rounded-md border border-primary/30 bg-accent/50 p-4 text-sm">
                        <div className="font-semibold text-foreground">
                          Kết quả chấm điểm: {exerciseResult.score}/{exerciseResult.maxScore} điểm (
                          {exerciseResult.accuracyPercent}%) —{" "}
                          {exerciseResult.passed ? "Đạt yêu cầu bài học" : "Cần ôn tập thêm"}
                        </div>
                        {exerciseResult.generatedFlashcards > 0 ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Đã tự động tạo {exerciseResult.generatedFlashcards} thẻ Flashcard vào bộ &ldquo;Lỗi sai cần ôn tập&rdquo;.
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      disabled={submittingExercise}
                      onClick={() => handleSubmitExercise(primaryExercise.id)}
                    >
                      {submittingExercise ? "Đang chấm điểm trên máy chủ..." : "Nộp bài kiểm tra"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            >
              Mục trước
            </Button>
            {activeSection ? (
              <Button
                type="button"
                onClick={() => markSectionDone(activeSection.sectionType)}
              >
                {activeIndex < lesson.sections.length - 1
                  ? "Hoàn thành mục này & Tiếp tục"
                  : "Hoàn thành bài học"}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Compact Right Study Companion */}
        <aside className="space-y-4 lg:col-span-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tóm tắt bài học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Từ vựng trọng tâm</span>
                <span className="font-medium text-foreground">{lesson.vocabulary.length} từ</span>
              </div>
              <div className="flex justify-between">
                <span>Điểm ngữ pháp</span>
                <span className="font-medium text-foreground">{lesson.grammar.length} mục</span>
              </div>
              <div className="flex justify-between">
                <span>Chữ Hán luyện viết</span>
                <span className="font-medium text-foreground">{lesson.characters.length} chữ</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Cần giải thích thêm?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <p>
                Hỏi Gia sư AI về sự khác biệt ngữ pháp, đặt thêm ví dụ hoặc sửa câu của bạn theo trình độ bài này.
              </p>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/ai-tutor">Mở Gia sư AI</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
