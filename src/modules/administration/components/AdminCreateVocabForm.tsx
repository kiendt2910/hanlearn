"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminCreateVocabForm({
  levels,
}: {
  levels: Array<{ id: string; titleVi: string }>;
}) {
  const router = useRouter();
  const [simplified, setSimplified] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [primaryMeaningVi, setPrimaryMeaningVi] = useState("");
  const [learningLevelId, setLearningLevelId] = useState(levels[0]?.id ?? "");
  const [status, setStatus] = useState("PUBLISHED");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simplified.trim() || !pinyin.trim() || !primaryMeaningVi.trim()) {
      toast.error("Vui lòng nhập chữ Hán, Pinyin và nghĩa tiếng Việt.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simplified,
          pinyin,
          primaryMeaningVi,
          learningLevelId: learningLevelId || undefined,
          status,
        }),
      });
      if (!res.ok) throw new Error();
      setSimplified("");
      setPinyin("");
      setPrimaryMeaningVi("");
      toast.success("Đã lưu từ vựng vào CMS và ghi nhật ký kiểm tra.");
      router.refresh();
    } catch {
      toast.error("Không thể lưu từ vựng.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
      <Input
        placeholder="Chữ Hán (VD: 朋友)"
        value={simplified}
        onChange={(e) => setSimplified(e.target.value)}
      />
      <Input
        placeholder="Pinyin (VD: péngyou)"
        value={pinyin}
        onChange={(e) => setPinyin(e.target.value)}
      />
      <Input
        placeholder="Nghĩa tiếng Việt (VD: Bạn bè)"
        value={primaryMeaningVi}
        onChange={(e) => setPrimaryMeaningVi(e.target.value)}
      />
      <select
        value={learningLevelId}
        onChange={(e) => setLearningLevelId(e.target.value)}
        className="h-9 rounded-md border border-border bg-surface px-2 text-xs"
      >
        {levels.map((l) => (
          <option key={l.id} value={l.id}>
            {l.titleVi}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-9 rounded-md border border-border bg-surface px-2 text-xs"
      >
        <option value="DRAFT">Nháp (DRAFT)</option>
        <option value="PUBLISHED">Xuất bản (PUBLISHED)</option>
      </select>
      <Button type="submit" size="sm" disabled={saving}>
        <Plus className="h-3.5 w-3.5" />
        Thêm từ vựng
      </Button>
    </form>
  );
}
