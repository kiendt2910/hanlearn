"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const TONE_DATA = [
  {
    id: 1,
    nameVi: "Thanh 1 (Âm bình)",
    mark: "ˉ",
    contour: "5 → 5",
    syllable: "mā",
    hanzi: "妈",
    meaningVi: "Mẹ",
    path: "M 12 18 L 88 18",
    color: "#2563EB",
    guideVi: "Cao và phẳng đều như nốt nhạc ngân dài; không tụt giọng ở cuối.",
  },
  {
    id: 2,
    nameVi: "Thanh 2 (Dương bình)",
    mark: "ˊ",
    contour: "3 → 5",
    syllable: "má",
    hanzi: "麻",
    meaningVi: "Cây gai / Tê",
    path: "M 14 54 Q 52 38 86 18",
    color: "#059669",
    guideVi: "Đi lên gọn từ mức giữa lên cao, như giọng ngạc nhiên hỏi 'Hả?'.",
  },
  {
    id: 3,
    nameVi: "Thanh 3 (Thượng thanh)",
    mark: "ˇ",
    contour: "2 → 1 → 4",
    syllable: "mǎ",
    hanzi: "马",
    meaningVi: "Con ngựa",
    path: "M 12 66 Q 42 88 54 84 Q 72 64 88 32",
    color: "#D97706",
    guideVi: "Hạ xuống rất trầm rồi nhấc nhẹ lên; trong câu thường chỉ đọc phần trầm (2→1).",
  },
  {
    id: 4,
    nameVi: "Thanh 4 (Khứ thanh)",
    mark: "ˋ",
    contour: "5 → 1",
    syllable: "mà",
    hanzi: "骂",
    meaningVi: "Mắng",
    path: "M 14 18 L 86 84",
    color: "#DC2626",
    guideVi: "Rơi nhanh, mạnh và dứt khoát từ cao nhất xuống thấp nhất.",
  },
  {
    id: 5,
    nameVi: "Thanh nhẹ (Khinh thanh)",
    mark: "·",
    contour: "Nhẹ & ngắn",
    syllable: "ma",
    hanzi: "吗",
    meaningVi: "Trợ từ hỏi (...không?)",
    path: "",
    color: "#64748B",
    guideVi: "Thả lỏng hoàn toàn, đọc ngắn và nhẹ sau âm tiết mang thanh điệu.",
  },
];

export function TonePitchDiagram({ speed = 1.0 }: { speed?: number }) {
  const [activeTone, setActiveTone] = useState(1);

  const speak = (text: string, toneId: number) => {
    setActiveTone(toneId);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = speed;
    window.speechSynthesis.speak(u);
  };

  const selected = TONE_DATA.find((t) => t.id === activeTone) ?? TONE_DATA[0];

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Biểu đồ Cao độ 5 bậc — 4 Thanh điệu & Thanh nhẹ (Cùng âm tiết ma)
          </h3>
          <p className="text-xs text-muted-foreground">
            Bấm vào từng thẻ thanh điệu để nghe phát âm và quan sát đường cao độ tương ứng.
          </p>
        </div>
        <Badge variant="outline">Tốc độ nghe: {speed}x</Badge>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {TONE_DATA.map((tone) => {
          const active = tone.id === activeTone;
          return (
            <button
              key={tone.id}
              type="button"
              onClick={() => speak(tone.hanzi, tone.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-md border p-3 text-center transition-colors cursor-pointer",
                active
                  ? "border-primary bg-accent/60"
                  : "border-border bg-surface hover:bg-surface-muted"
              )}
            >
              <div className="flex w-full items-center justify-between text-[11px] font-semibold">
                <span style={{ color: tone.color }}>{tone.contour}</span>
                <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              <svg
                viewBox="0 0 100 100"
                role="img"
                aria-label={`Đồ thị cao độ ${tone.nameVi}: ${tone.contour}`}
                className="h-20 w-full rounded border border-border/60 bg-background"
              >
                {[18, 35, 52, 68, 84].map((y, idx) => (
                  <g key={y}>
                    <line x1="8" y1={y} x2="92" y2={y} stroke="#CBD5E1" strokeDasharray="2 2" strokeWidth="0.7" />
                    <text x="2" y={y + 2} fontSize="6" fill="#94A3B8">
                      {5 - idx}
                    </text>
                  </g>
                ))}
                {tone.path ? (
                  <path
                    d={tone.path}
                    fill="none"
                    stroke={tone.color}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <circle cx="50" cy="52" r="7" fill={tone.color} />
                )}
              </svg>

              <div>
                <div lang="zh-Hans" className="font-hanzi text-2xl font-bold text-foreground">
                  {tone.hanzi}
                </div>
                <div className="font-pinyin text-sm font-semibold" style={{ color: tone.color }}>
                  {tone.syllable}
                </div>
                <div className="text-xs text-muted-foreground">{tone.meaningVi}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-border bg-surface p-3 text-xs">
        <span className="font-semibold text-foreground">{selected.nameVi}: </span>
        <span className="text-muted-foreground">{selected.guideVi}</span>
      </div>
    </div>
  );
}
