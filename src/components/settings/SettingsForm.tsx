"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsForm({
  initial,
}: {
  initial: {
    displayName: string;
    dailyGoalMinutes: number;
    showPinyinByDefault: boolean;
    showTranslationDefault: boolean;
    audioPlaybackSpeed: number;
    dailyFlashcardLimit: number;
    autoGenerateFlashcards: boolean;
    offlineAutoSync: boolean;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Đã lưu cài đặt học tập.");
      router.refresh();
    } catch {
      toast.error("Không thể lưu cài đặt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ & Mục tiêu học tập</CardTitle>
          <CardDescription>Cập nhật tên hiển thị và thời lượng mục tiêu hằng ngày.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input
              id="displayName"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dailyGoal">Mục tiêu mỗi ngày (phút)</Label>
            <Input
              id="dailyGoal"
              type="number"
              min={5}
              max={360}
              value={form.dailyGoalMinutes}
              onChange={(e) =>
                setForm({ ...form, dailyGoalMinutes: Number(e.target.value) || 30 })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hiển thị tiếng Trung, Âm thanh & Flashcards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <label className="flex items-center justify-between gap-3">
            <span>Hiển thị Pinyin mặc định trong bài học</span>
            <input
              type="checkbox"
              checked={form.showPinyinByDefault}
              onChange={(e) => setForm({ ...form, showPinyinByDefault: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Hiển thị bản dịch tiếng Việt mặc định</span>
            <input
              type="checkbox"
              checked={form.showTranslationDefault}
              onChange={(e) => setForm({ ...form, showTranslationDefault: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Tự động tạo Flashcard từ câu làm sai trong bài tập</span>
            <input
              type="checkbox"
              checked={form.autoGenerateFlashcards}
              onChange={(e) => setForm({ ...form, autoGenerateFlashcards: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Tự động đồng bộ tiến độ Offline khi có mạng</span>
            <input
              type="checkbox"
              checked={form.offlineAutoSync}
              onChange={(e) => setForm({ ...form, offlineAutoSync: e.target.checked })}
            />
          </label>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving}>
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
