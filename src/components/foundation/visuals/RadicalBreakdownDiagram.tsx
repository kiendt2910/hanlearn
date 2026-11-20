"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";
import { cn } from "@/lib/utils/cn";

export interface CharacterBreakdownExample {
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  structureVi: string;
  parts: Array<{
    symbol: string;
    role: "SEMANTIC" | "PHONETIC" | "STRUCTURAL";
    labelVi: string;
  }>;
  noteVi: string;
}

export const SAMPLE_BREAKDOWNS: CharacterBreakdownExample[] = [
  {
    hanzi: "妈",
    pinyin: "mā",
    meaningVi: "Mẹ",
    structureVi: "Trái – Phải (Hình thanh)",
    parts: [
      { symbol: "女", role: "SEMANTIC", labelVi: "Gợi nghĩa: phụ nữ" },
      { symbol: "马", role: "PHONETIC", labelVi: "Gợi âm: mǎ → mā (KHÔNG phải nghĩa con ngựa)" },
    ],
    noteVi: "Ví dụ kinh điển của chữ Hình thanh: 1 bên gợi nhóm nghĩa, 1 bên gợi âm đọc.",
  },
  {
    hanzi: "你",
    pinyin: "nǐ",
    meaningVi: "Bạn",
    structureVi: "Trái – Phải",
    parts: [
      { symbol: "亻", role: "SEMANTIC", labelVi: "Biến thể của 人 (người)" },
      { symbol: "尔", role: "STRUCTURAL", labelVi: "Thành phần cấu tạo / âm cổ" },
    ],
    noteVi: "Bộ Nhân đứng 亻 xuất hiện bên trái rất nhiều chữ chỉ con người và hành động người.",
  },
  {
    hanzi: "好",
    pinyin: "hǎo",
    meaningVi: "Tốt, khỏe",
    structureVi: "Trái – Phải (Hội ý)",
    parts: [
      { symbol: "女", role: "SEMANTIC", labelVi: "Phụ nữ / người mẹ" },
      { symbol: "子", role: "SEMANTIC", labelVi: "Đứa con" },
    ],
    noteVi: "Ghép 2 bộ phận mang nghĩa: người mẹ bên đứa con gợi cảm giác tốt đẹp.",
  },
  {
    hanzi: "河",
    pinyin: "hé",
    meaningVi: "Con sông",
    structureVi: "Trái – Phải (Hình thanh)",
    parts: [
      { symbol: "氵", role: "SEMANTIC", labelVi: "Biến thể của 水 (nước)" },
      { symbol: "可", role: "PHONETIC", labelVi: "Gợi âm: kě (gần vần e)" },
    ],
    noteVi: "Thấy 3 chấm thủy 氵 bên trái, thường chữ liên quan tới nước hoặc chất lỏng.",
  },
  {
    hanzi: "休",
    pinyin: "xiū",
    meaningVi: "Nghỉ ngơi",
    structureVi: "Trái – Phải (Hội ý)",
    parts: [
      { symbol: "亻", role: "SEMANTIC", labelVi: "Người (人)" },
      { symbol: "木", role: "SEMANTIC", labelVi: "Cái cây" },
    ],
    noteVi: "Hình ảnh một người tựa lưng vào gốc cây nghỉ ngơi.",
  },
  {
    hanzi: "明",
    pinyin: "míng",
    meaningVi: "Sáng sủa; ngày mai",
    structureVi: "Trái – Phải (Hội ý)",
    parts: [
      { symbol: "日", role: "SEMANTIC", labelVi: "Mặt trời" },
      { symbol: "月", role: "SEMANTIC", labelVi: "Mặt trăng" },
    ],
    noteVi: "Mặt trời và mặt trăng cùng chiếu → sáng rực rỡ (明).",
  },
  {
    hanzi: "语",
    pinyin: "yǔ",
    meaningVi: "Ngôn ngữ, tiếng nói",
    structureVi: "Trái – Phải (Hình thanh)",
    parts: [
      { symbol: "讠", role: "SEMANTIC", labelVi: "Biến thể của 言 (lời nói)" },
      { symbol: "吾", role: "PHONETIC", labelVi: "Gợi âm: wú → yǔ" },
    ],
    noteVi: "Bộ Ngôn 讠 đứng bên trái xuất hiện trong 汉语 (tiếng Hán), 谢谢 (cảm ơn), 说 (nói).",
  },
  {
    hanzi: "林",
    pinyin: "lín",
    meaningVi: "Khu rừng",
    structureVi: "Trái – Phải (Hội ý)",
    parts: [
      { symbol: "木", role: "SEMANTIC", labelVi: "Cây (thu gọn bên trái)" },
      { symbol: "木", role: "SEMANTIC", labelVi: "Cây" },
    ],
    noteVi: "Hai cây đứng cạnh nhau thành khu rừng (林); ba cây thành rừng rậm (森).",
  },
];

const ROLE_STYLES = {
  SEMANTIC: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
  PHONETIC: "border-purple-300 bg-purple-50 text-purple-900 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-200",
  STRUCTURAL: "border-border bg-surface-muted text-foreground",
};

const ROLE_LABELS = {
  SEMANTIC: "Thành phần gợi nghĩa",
  PHONETIC: "Thành phần gợi âm",
  STRUCTURAL: "Thành phần cấu tạo",
};

export function RadicalBreakdownDiagram({
  items = SAMPLE_BREAKDOWNS,
}: {
  items?: CharacterBreakdownExample[];
}) {
  const [selected, setSelected] = useState(items[0]?.hanzi ?? "妈");
  const current = items.find((i) => i.hanzi === selected) ?? items[0];

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">
          Bấm vào từng chữ Hán để tách bộ phận Nghĩa / Âm:
        </span>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <Badge variant="default">Xanh lam: Gợi nghĩa</Badge>
          <Badge variant="secondary">Tím: Gợi âm</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item.hanzi}
            type="button"
            onClick={() => setSelected(item.hanzi)}
            className={cn(
              "font-hanzi rounded-md border px-3 py-1.5 text-lg font-semibold cursor-pointer",
              item.hanzi === current.hanzi
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            )}
          >
            {item.hanzi}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-baseline gap-2.5">
            <span lang="zh-Hans" className="font-hanzi text-3xl font-bold text-foreground">
              {current.hanzi}
            </span>
            <span className="font-pinyin text-sm font-medium text-primary">
              {current.pinyin}
            </span>
            <span className="text-sm font-medium text-foreground">— {current.meaningVi}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{current.structureVi}</Badge>
            <ChineseAudioPlayer textZh={current.hanzi} compact />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {current.parts.map((part, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 ? <span className="text-lg font-bold text-muted-foreground">+</span> : null}
              <div className={cn("rounded-md border px-3 py-2", ROLE_STYLES[part.role])}>
                <div className="flex items-baseline gap-2">
                  <span lang="zh-Hans" className="font-hanzi text-2xl font-bold">
                    {part.symbol}
                  </span>
                  <span className="text-[11px] font-semibold opacity-80">
                    {ROLE_LABELS[part.role]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs">{part.labelVi}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{current.noteVi}</p>
      </div>
    </div>
  );
}
