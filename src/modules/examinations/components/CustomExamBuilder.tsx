"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SKILLS = [
  { code: "LISTENING", label: "Nghe hiểu" },
  { code: "READING", label: "Đọc hiểu" },
  { code: "GRAMMAR", label: "Ngữ pháp" },
  { code: "VOCABULARY", label: "Từ vựng" },
  { code: "WRITING", label: "Viết & Sắp xếp câu" },
  { code: "PRONUNCIATION", label: "Thanh điệu" },
];

export function CustomExamBuilder() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["GRAMMAR", "READING"]);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [questionLimit, setQuestionLimit] = useState(6);
  const [creating, setCreating] = useState(false);

  const toggleSkill = (code: string) => {
    setSelectedSkills((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleBuild = async () => {
    if (selectedSkills.length === 0) {
      toast.error("Hãy chọn ít nhất 1 kỹ năng.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/v1/exams/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: selectedSkills,
          durationMinutes,
          questionLimit,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json?.error?.message ?? "Không thể tạo đề tùy chỉnh.");
        setCreating(false);
        return;
      }
      router.push(`/exams/attempts/${json.data.attemptId}`);
    } catch {
      toast.error("Không thể tạo đề tùy chỉnh.");
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Tạo đề luyện tập tùy chỉnh
        </CardTitle>
        <CardDescription>
          Chọn kỹ năng, thời gian và số lượng câu hỏi từ ngân hàng câu hỏi để luyện tập tập trung.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((s) => {
            const active = selectedSkills.includes(s.code);
            return (
              <button
                key={s.code}
                type="button"
                onClick={() => toggleSkill(s.code)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2">
            <span>Thời gian (phút):</span>
            <input
              type="number"
              min={3}
              max={120}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 10)}
              className="h-8 w-20 rounded-md border border-border bg-surface px-2"
            />
          </label>
          <label className="flex items-center gap-2">
            <span>Số câu tối đa:</span>
            <input
              type="number"
              min={2}
              max={40}
              value={questionLimit}
              onChange={(e) => setQuestionLimit(Number(e.target.value) || 6)}
              className="h-8 w-20 rounded-md border border-border bg-surface px-2"
            />
          </label>
          <Button type="button" size="sm" onClick={handleBuild} disabled={creating}>
            {creating ? "Đang tạo đề..." : "Tạo & Bắt đầu làm bài"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
