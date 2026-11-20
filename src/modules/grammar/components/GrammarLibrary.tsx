"use client";

import { Layers } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface GrammarPointItem {
  id: string;
  titleVi: string;
  patternZh: string;
  patternPinyin?: string | null;
  explanationVi: string;
  usageNotesVi?: string | null;
  comparisonsVi?: string | null;
  commonErrorsVi?: string | null;
  levelTitleVi?: string | null;
  examples: Array<{
    sentenceZh: string;
    pinyin: string;
    translationVi: string;
    isIncorrect: boolean;
  }>;
}

export function GrammarLibrary({ items }: { items: GrammarPointItem[] }) {
  const addGrammarFlashcard = async (id: string, title: string) => {
    try {
      const res = await fetch("/api/v1/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "grammar", grammarPointId: id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      toast.success(
        json.data.created
          ? `Đã thêm mẫu ngữ pháp "${title}" vào Flashcard.`
          : `Mẫu ngữ pháp này đã tồn tại trong Flashcard.`
      );
    } catch {
      toast.error("Không thể thêm thẻ ngữ pháp.");
    }
  };

  return (
    <div className="space-y-4">
      {items.map((g) => (
        <Card key={g.id}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {g.levelTitleVi ? <Badge variant="secondary">{g.levelTitleVi}</Badge> : null}
                <CardTitle className="text-base">{g.titleVi}</CardTitle>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addGrammarFlashcard(g.id, g.titleVi)}
              >
                <Layers className="h-3.5 w-3.5" />
                Tạo Flashcard
              </Button>
            </div>
            <div className="mt-2 rounded-md border border-border bg-background px-3 py-2">
              <div lang="zh-Hans" className="font-hanzi text-lg font-semibold text-primary">
                {g.patternZh}
              </div>
              {g.patternPinyin ? (
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
                <strong>Lưu ý sử dụng:</strong> {g.usageNotesVi}
              </p>
            ) : null}
            {g.comparisonsVi ? (
              <p className="text-xs text-muted-foreground">
                <strong>Đối chiếu tiếng Việt:</strong> {g.comparisonsVi}
              </p>
            ) : null}
            {g.commonErrorsVi ? (
              <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">
                <strong>Lỗi thường gặp:</strong> {g.commonErrorsVi}
              </p>
            ) : null}
            <div className="space-y-2">
              {g.examples.map((ex, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-md border p-3 text-xs",
                    ex.isIncorrect
                      ? "border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20"
                      : "border-border bg-background"
                  )}
                >
                  <div lang="zh-Hans" className="font-hanzi text-base text-foreground">
                    {ex.isIncorrect ? "✗ " : "✓ "}
                    {ex.sentenceZh}
                  </div>
                  <div className="font-pinyin text-primary">{ex.pinyin}</div>
                  <div className="text-muted-foreground">{ex.translationVi}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
