"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Layers, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DeckSummary {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  totalCards: number;
  dueCards: number;
}

export function FlashcardsManager({
  decks,
  totalDue,
}: {
  decks: DeckSummary[];
  totalDue: number;
}) {
  const router = useRouter();
  const [deckName, setDeckName] = useState("");
  const [deckDesc, setDeckDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [newCardDeckId, setNewCardDeckId] = useState(decks[0]?.id ?? "");
  const [frontZh, setFrontZh] = useState("");
  const [frontPinyin, setFrontPinyin] = useState("");
  const [backVi, setBackVi] = useState("");

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/v1/flashcards/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deckName, description: deckDesc || undefined }),
      });
      if (!res.ok) throw new Error();
      setDeckName("");
      setDeckDesc("");
      toast.success("Đã tạo bộ thẻ Flashcard mới.");
      router.refresh();
    } catch {
      toast.error("Không thể tạo bộ thẻ (có thể trùng tên).");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardDeckId || !frontZh.trim() || !backVi.trim()) {
      toast.error("Vui lòng chọn bộ thẻ và nhập chữ Hán + nghĩa tiếng Việt.");
      return;
    }
    try {
      const res = await fetch("/api/v1/flashcards/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId: newCardDeckId,
          frontZh,
          frontPinyin: frontPinyin || undefined,
          backVi,
        }),
      });
      if (!res.ok) throw new Error();
      setFrontZh("");
      setFrontPinyin("");
      setBackVi("");
      toast.success("Đã thêm thẻ mới vào bộ thẻ.");
      router.refresh();
    } catch {
      toast.error("Không thể thêm thẻ Flashcard.");
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      const cards = Array.isArray(raw) ? raw : raw.cards ?? raw.decks?.[0]?.flashcards ?? [];
      const res = await fetch("/api/v1/flashcards/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckName: `Nhập từ ${file.name.replace(/\.json$/i, "")}`,
          cards,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      toast.success(`Đã nhập ${json.data.imported} thẻ Flashcard.`);
      router.refresh();
    } catch {
      toast.error("Tệp JSON không đúng định dạng Flashcard.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Tổng số thẻ đến hạn ôn tập hôm nay (FSRS):{" "}
            <span className="text-primary">{totalDue} thẻ</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Hệ thống tự động lên lịch ôn theo độ ổn định (Stability) và độ khó (Difficulty) của từng thẻ.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/flashcards/review">
              <Layers className="h-4 w-4" />
              Bắt đầu ôn tập ngay ({totalDue})
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/v1/flashcards/export">
              <Download className="h-3.5 w-3.5" />
              Xuất JSON
            </a>
          </Button>
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium hover:bg-surface-muted">
            <Upload className="h-3.5 w-3.5" />
            <span>Nhập JSON</span>
            <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
          </label>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {decks.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Chưa có bộ thẻ nào. Hãy tạo bộ thẻ bên dưới hoặc bấm &ldquo;+ Flashcard bài học&rdquo; trong bất kỳ bài học nào!
            </CardContent>
          </Card>
        ) : (
          decks.map((deck) => (
            <Card key={deck.id} className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={deck.dueCards > 0 ? "warning" : "success"}>
                    {deck.dueCards} đến hạn
                  </Badge>
                  <span className="text-xs text-muted-foreground">{deck.totalCards} thẻ</span>
                </div>
                <CardTitle className="mt-2 text-base">{deck.name}</CardTitle>
                {deck.description ? (
                  <CardDescription>{deck.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href={`/flashcards/review?deckId=${deck.id}`}>Ôn bộ này</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/flashcards/decks/${deck.id}`}>Xem danh sách thẻ</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Deck & Quick Add Card */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tạo bộ thẻ mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDeck} className="space-y-3">
              <Input
                placeholder="Tên bộ thẻ (VD: Từ vựng HSK 1 cá nhân)"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
              />
              <Input
                placeholder="Mô tả ngắn (không bắt buộc)"
                value={deckDesc}
                onChange={(e) => setDeckDesc(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={creating}>
                <Plus className="h-3.5 w-3.5" />
                Tạo bộ thẻ
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thêm thẻ thủ công nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCard} className="space-y-3">
              <select
                value={newCardDeckId}
                onChange={(e) => setNewCardDeckId(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
              >
                <option value="">-- Chọn bộ thẻ --</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Chữ Hán (VD: 学习)"
                  value={frontZh}
                  onChange={(e) => setFrontZh(e.target.value)}
                />
                <Input
                  placeholder="Pinyin (VD: xuéxí)"
                  value={frontPinyin}
                  onChange={(e) => setFrontPinyin(e.target.value)}
                />
              </div>
              <Input
                placeholder="Nghĩa tiếng Việt (VD: Học tập)"
                value={backVi}
                onChange={(e) => setBackVi(e.target.value)}
              />
              <Button type="submit" size="sm" variant="outline" disabled={decks.length === 0}>
                <Plus className="h-3.5 w-3.5" />
                Thêm thẻ vào bộ
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
