"use client";

import { Badge } from "@/components/ui/badge";

const STRUCTURES = [
  {
    code: "SINGLE",
    nameVi: "Độc thể (1 khối)",
    examples: ["人", "木", "口", "日"],
    tipVi: "Một khối không tách nhỏ hơn, cần đặt cân giữa tâm ô Mễ.",
    boxes: [{ x: 18, y: 18, w: 64, h: 64, fill: "#DBEAFE" }],
  },
  {
    code: "LEFT_RIGHT",
    nameVi: "Trái – Phải",
    examples: ["你", "好", "妈", "明"],
    tipVi: "Bộ thủ bên trái thường hẹp (~1/3), phần bên phải rộng hơn (~2/3).",
    boxes: [
      { x: 12, y: 16, w: 28, h: 68, fill: "#DBEAFE" },
      { x: 44, y: 16, w: 44, h: 68, fill: "#EDE9FE" },
    ],
  },
  {
    code: "TOP_BOTTOM",
    nameVi: "Trên – Dưới",
    examples: ["字", "草", "思", "家"],
    tipVi: "Viết gọn phần trên trước rồi mới đặt phần dưới cân trục dọc.",
    boxes: [
      { x: 16, y: 12, w: 68, h: 30, fill: "#DBEAFE" },
      { x: 16, y: 46, w: 68, h: 42, fill: "#EDE9FE" },
    ],
  },
  {
    code: "ENCLOSING",
    nameVi: "Bao vây toàn phần",
    examples: ["国", "回", "园"],
    tipVi: "Viết khung ngoài trước → điền phần trong → đóng nét ngang đáy sau cùng.",
    boxes: [
      { x: 12, y: 12, w: 76, h: 76, fill: "#DBEAFE" },
      { x: 28, y: 28, w: 44, h: 44, fill: "#FEF3C7" },
    ],
  },
  {
    code: "SEMI_ENCLOSING",
    nameVi: "Bán bao vây",
    examples: ["问", "这", "同"],
    tipVi: "Bao bọc 2 hoặc 3 mặt; chú ý phần bao ôm vừa vặn phần lõi.",
    boxes: [
      { x: 12, y: 12, w: 76, h: 76, fill: "#DBEAFE" },
      { x: 30, y: 30, w: 58, h: 58, fill: "#EDE9FE" },
    ],
  },
  {
    code: "SYMMETRICAL",
    nameVi: "Đối xứng trục giữa",
    examples: ["小", "水", "山"],
    tipVi: "Viết trục giữa trước rồi mới viết hai bên trái – phải cho cân đối.",
    boxes: [
      { x: 40, y: 12, w: 20, h: 76, fill: "#DBEAFE" },
      { x: 14, y: 34, w: 22, h: 40, fill: "#DCFCE7" },
      { x: 64, y: 34, w: 22, h: 40, fill: "#DCFCE7" },
    ],
  },
];

export function CharacterStructureDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {STRUCTURES.map((st) => (
        <div key={st.code} className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 100 100"
              role="img"
              aria-label={`Sơ đồ cấu trúc chữ ${st.nameVi}`}
              className="h-16 w-16 shrink-0 rounded border border-border bg-surface"
            >
              {st.boxes.map((b, i) => (
                <rect
                  key={i}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx="4"
                  fill={b.fill}
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            <div>
              <div className="text-xs font-semibold text-foreground">{st.nameVi}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {st.examples.map((ch) => (
                  <Badge key={ch} variant="secondary" className="font-hanzi text-sm">
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{st.tipVi}</p>
        </div>
      ))}
    </div>
  );
}
