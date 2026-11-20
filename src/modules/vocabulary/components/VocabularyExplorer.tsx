"use client";

import { useMemo, useState } from "react";
import { Bookmark, Layers, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";

export interface VocabListItem {
  id: string;
  simplified: string;
  traditional?: string | null;
  pinyin: string;
  pinyinNumbered?: string | null;
  partOfSpeech?: string | null;
  primaryMeaningVi: string;
  primaryMeaningEn?: string | null;
  commonMistakesVi?: string | null;
  levelTitleVi?: string | null;
  isBookmarked: boolean;
  example?: { sentenceZh: string; pinyin: string; translationVi: string } | null;
}

export function VocabularyExplorer({ items }: { items: VocabListItem[] }) {
  const [query, setQuery] = useState("");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.isBookmarked]))
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (onlyBookmarked && !bookmarks[item.id]) return false;
      if (!q) return true;
      return (
        item.simplified.includes(q) ||
        item.pinyin.toLowerCase().includes(q) ||
        (item.pinyinNumbered ?? "").toLowerCase().includes(q) ||
        item.primaryMeaningVi.toLowerCase().includes(q)
      );
    });
  }, [items, query, onlyBookmarked, bookmarks]);

  const toggleBookmark = async (id: string) => {
    const next = !bookmarks[id];
    setBookmarks((prev) => ({ ...prev, [id]: next }));
    try {
      const res = await fetch(`/api/v1/vocabulary/${id}/bookmark`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success(next ? "Đã đánh dấu từ vựng." : "Đã bỏ đánh dấu từ vựng.");
    } catch {
      setBookmarks((prev) => ({ ...prev, [id]: !next }));
      toast.error("Không thể cập nhật trạng thái đánh dấu.");
    }
  };

  const addToFlashcard = async (id: string, word: string) => {
    try {
      const res = await fetch("/api/v1/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "vocabulary", vocabularyId: id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      toast.success(
        json.data.created
          ? `Đã thêm "${word}" vào Flashcards.`
          : `Từ "${word}" đã có sẵn trong Flashcards (không tạo trùng).`
      );
    } catch {
      toast.error("Không thể thêm vào Flashcards.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo chữ Hán (你好), Pinyin (ni3 hao3) hoặc nghĩa tiếng Việt..."
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant={onlyBookmarked ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyBookmarked((v) => !v)}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Từ đã đánh dấu
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Hiển thị {filtered.length} / {items.length} mục từ vựng đã xác minh.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((v) => (
          <Card key={v.id}>
            <CardContent className="space-y-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span lang="zh-Hans" className="font-hanzi text-2xl font-bold text-foreground">
                      {v.simplified}
                    </span>
                    <span className="font-pinyin text-sm font-medium text-primary">
                      {v.pinyin}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {v.levelTitleVi ? <Badge variant="secondary">{v.levelTitleVi}</Badge> : null}
                    {v.partOfSpeech ? <Badge variant="outline">{v.partOfSpeech}</Badge> : null}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <ChineseAudioPlayer textZh={v.simplified} compact />
                  <Button
                    type="button"
                    size="icon"
                    variant={bookmarks[v.id] ? "default" : "ghost"}
                    className="h-7 w-7"
                    aria-label="Đánh dấu từ vựng"
                    onClick={() => toggleBookmark(v.id)}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-sm font-medium text-foreground">
                {v.primaryMeaningVi}
                {v.primaryMeaningEn ? (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    ({v.primaryMeaningEn})
                  </span>
                ) : null}
              </p>

              {v.example ? (
                <div className="rounded-md border border-border bg-background p-2.5 text-xs">
                  <div lang="zh-Hans" className="font-hanzi text-sm text-foreground">
                    {v.example.sentenceZh}
                  </div>
                  <div className="font-pinyin text-primary">{v.example.pinyin}</div>
                  <div className="text-muted-foreground">{v.example.translationVi}</div>
                </div>
              ) : null}

              {v.commonMistakesVi ? (
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Lưu ý:</strong> {v.commonMistakesVi}
                </p>
              ) : null}

              <div className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addToFlashcard(v.id, v.simplified)}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Thêm vào Flashcard
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
