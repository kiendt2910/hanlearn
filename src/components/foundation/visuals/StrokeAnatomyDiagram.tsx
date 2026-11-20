"use client";

import { useRef, useState } from "react";
import { Eraser, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface BasicStrokeSpec {
  id: string;
  hanzi: string;
  pinyin: string;
  nameVi: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  path: string;
  directionVi: string;
  mistakeVi: string;
  examples: string[];
}

export const EIGHT_BASIC_STROKES: BasicStrokeSpec[] = [
  {
    id: "heng",
    hanzi: "横",
    pinyin: "héng",
    nameVi: "Nét Ngang",
    startPoint: { x: 18, y: 52 },
    endPoint: { x: 82, y: 48 },
    path: "M 18 52 L 82 48",
    directionVi: "Đặt bút bên trái → kéo thẳng sang phải (hơi chếch lên rất nhẹ) → dừng gọn.",
    mistakeVi: "Tránh viết ngược từ phải sang trái hoặc kéo võng xuống giữa nét.",
    examples: ["一", "二", "三", "十"],
  },
  {
    id: "shu",
    hanzi: "竖",
    pinyin: "shù",
    nameVi: "Nét Sổ",
    startPoint: { x: 50, y: 14 },
    endPoint: { x: 50, y: 86 },
    path: "M 50 14 L 50 86",
    directionVi: "Đặt bút ở trên → kéo thẳng đứng xuống dưới làm trụ chữ.",
    mistakeVi: "Tránh kéo từ dưới lên trên hoặc để trục bị nghiêng sang trái/phải.",
    examples: ["十", "中", "口"],
  },
  {
    id: "pie",
    hanzi: "撇",
    pinyin: "piě",
    nameVi: "Nét Phẩy",
    startPoint: { x: 66, y: 18 },
    endPoint: { x: 24, y: 84 },
    path: "M 66 18 Q 52 56 24 84",
    directionVi: "Đặt bút trên-phải → lượn cong nhẹ xuống dưới-trái → nhấc bút mảnh ở đuôi.",
    mistakeVi: "Không kéo cứng đơ như đường chéo thẳng và không viết ngược lên.",
    examples: ["人", "八", "大"],
  },
  {
    id: "na",
    hanzi: "捺",
    pinyin: "nà",
    nameVi: "Nét Mác",
    startPoint: { x: 32, y: 20 },
    endPoint: { x: 82, y: 82 },
    path: "M 32 20 Q 52 60 82 82",
    directionVi: "Từ trên-trái kéo chếch xuống dưới-phải → nhấn đậm rồi kéo ngang nhẹ ra đuôi.",
    mistakeVi: "Không bỏ qua bước nhấn nhẹ ở chân nét khiến nét trông giống nét chấm dài.",
    examples: ["人", "大", "木"],
  },
  {
    id: "dian",
    hanzi: "点",
    pinyin: "diǎn",
    nameVi: "Nét Chấm",
    startPoint: { x: 42, y: 34 },
    endPoint: { x: 60, y: 62 },
    path: "M 42 34 Q 52 46 60 62",
    directionVi: "Chạm nhẹ ở trên → ấn dần xuống dưới-phải tạo hình giọt nước gọn.",
    mistakeVi: "Không vẽ thành dấu chấm tròn hoặc kéo dài quá nửa ô chữ.",
    examples: ["六", "主", "氵"],
  },
  {
    id: "ti",
    hanzi: "提",
    pinyin: "tí",
    nameVi: "Nét Hất",
    startPoint: { x: 24, y: 74 },
    endPoint: { x: 78, y: 34 },
    path: "M 24 74 L 78 34",
    directionVi: "Đặt bút nhấn ở dưới-trái → hất nhanh, nhọn lên trên-phải.",
    mistakeVi: "Rất dễ nhầm với Nét Phẩy! Nhớ: Hất đi LÊN (trái → phải), Phẩy đi XUỐNG.",
    examples: ["氵", "扌", "我"],
  },
  {
    id: "zhe",
    hanzi: "折",
    pinyin: "zhé",
    nameVi: "Nét Gập",
    startPoint: { x: 22, y: 28 },
    endPoint: { x: 76, y: 78 },
    path: "M 22 28 L 76 28 L 76 78",
    directionVi: "Kéo ngang → dừng hẳn tạo góc vuông sắc nét → kéo sổ xuống thành 1 nét liền.",
    mistakeVi: "Không tách thành 2 nét rời và không bo tròn góc gập.",
    examples: ["口", "日", "国"],
  },
  {
    id: "gou",
    hanzi: "钩",
    pinyin: "gōu",
    nameVi: "Nét Móc",
    startPoint: { x: 56, y: 16 },
    endPoint: { x: 38, y: 76 },
    path: "M 56 16 L 56 84 L 38 76",
    directionVi: "Kéo thân nét sổ → dừng tại đáy → bật móc ngắn, sắc lên trên-trái.",
    mistakeVi: "Tránh vẽ móc quá to làm mất cân đối ô chữ.",
    examples: ["小", "了", "月"],
  },
];

export function StrokeAnatomyStudio({
  strokes = EIGHT_BASIC_STROKES,
}: {
  strokes?: BasicStrokeSpec[];
}) {
  const [activeId, setActiveId] = useState(strokes[0]?.id ?? "heng");
  const [practiceMode, setPracticeMode] = useState<"trace" | "free">("trace");
  const [showOverlayCompare, setShowOverlayCompare] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const stroke = strokes.find((s) => s.id === activeId) ?? strokes[0];

  const clearCanvas = () => {
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  };

  const selectStroke = (id: string) => {
    setActiveId(id);
    setShowOverlayCompare(false);
    setAnimKey((k) => k + 1);
    clearCanvas();
  };

  const getPt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * c.width,
      y: ((e.clientY - rect.top) / rect.height) * c.height,
    };
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap gap-1.5">
        {strokes.map((st, i) => (
          <button
            key={st.id}
            type="button"
            onClick={() => selectStroke(st.id)}
            className={cn(
              "rounded-md border px-2.5 py-1.5 text-xs font-medium cursor-pointer",
              st.id === stroke.id
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            )}
          >
            {i + 1}. <span className="font-hanzi text-sm">{st.hanzi}</span> {st.nameVi}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: Annotated Stroke Anatomy */}
        <div className="space-y-3 rounded-md border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <span lang="zh-Hans" className="font-hanzi text-2xl font-bold text-foreground">
                {stroke.hanzi}
              </span>{" "}
              <span className="font-pinyin text-sm font-medium text-primary">
                {stroke.pinyin}
              </span>
              <span className="ml-2 text-sm font-semibold text-foreground">
                — {stroke.nameVi}
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAnimKey((k) => k + 1)}
            >
              <Play className="h-3.5 w-3.5" />
              Xem lại nét
            </Button>
          </div>

          <div className="flex justify-center">
            <svg
              key={animKey}
              viewBox="0 0 100 100"
              role="img"
              aria-label={`Minh họa hướng viết ${stroke.nameVi} (${stroke.hanzi})`}
              className="h-44 w-44 rounded-md border border-border bg-background"
            >
              {/* 米字格 Grid */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="0.6" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="0.6" />
              <line x1="0" y1="0" x2="100" y2="100" stroke="#E2E8F0" strokeDasharray="2 3" strokeWidth="0.5" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="#E2E8F0" strokeDasharray="2 3" strokeWidth="0.5" />
              {/* Stroke path */}
              <path
                d={stroke.path}
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="160"
                strokeDashoffset="0"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="160"
                  to="0"
                  dur="1.1s"
                  fill="freeze"
                />
              </path>
              {/* Start point (1) */}
              <circle cx={stroke.startPoint.x} cy={stroke.startPoint.y} r="4.5" fill="#16A34A" />
              <text x={stroke.startPoint.x - 1.8} y={stroke.startPoint.y + 2} fontSize="5.5" fill="#FFFFFF" fontWeight="700">
                1
              </text>
              {/* End point (2) */}
              <rect
                x={stroke.endPoint.x - 3.5}
                y={stroke.endPoint.y - 3.5}
                width="7"
                height="7"
                rx="1"
                fill="#DC2626"
              />
            </svg>
          </div>

          <div className="space-y-1.5 text-xs">
            <p className="text-foreground">
              <strong className="text-emerald-700 dark:text-emerald-400">● Điểm đặt bút & Hướng đi:</strong>{" "}
              {stroke.directionVi}
            </p>
            <p className="rounded bg-amber-50 px-2.5 py-1.5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <strong>Lỗi cần tránh:</strong> {stroke.mistakeVi}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-muted-foreground">Chữ mẫu chứa nét này:</span>
              {stroke.examples.map((ex) => (
                <Badge key={ex} variant="secondary" className="font-hanzi text-sm">
                  {ex}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interactive Tracing / Free Writing Practice */}
        <div className="flex flex-col items-center justify-between gap-3 rounded-md border border-border bg-surface p-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">Khung tập viết ô Mễ</span>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={practiceMode === "trace" ? "default" : "outline"}
                onClick={() => setPracticeMode("trace")}
              >
                Tô theo mẫu
              </Button>
              <Button
                type="button"
                size="sm"
                variant={practiceMode === "free" ? "default" : "outline"}
                onClick={() => setPracticeMode("free")}
              >
                Tự viết
              </Button>
            </div>
          </div>

          <div className="relative h-48 w-48 overflow-hidden rounded-md border border-border bg-background">
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <line x1="50" y1="0" x2="50" y2="100" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="0.6" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="0.6" />
              {practiceMode === "trace" || showOverlayCompare ? (
                <path
                  d={stroke.path}
                  fill="none"
                  stroke={showOverlayCompare ? "#16A34A" : "#CBD5E1"}
                  strokeOpacity={showOverlayCompare ? 0.55 : 0.8}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </svg>
            <canvas
              ref={canvasRef}
              width={220}
              height={220}
              onPointerDown={(e) => {
                const ctx = canvasRef.current?.getContext("2d");
                if (!ctx) return;
                drawingRef.current = true;
                const pt = getPt(e);
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineWidth = 7;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.strokeStyle = "#1D4ED8";
              }}
              onPointerMove={(e) => {
                if (!drawingRef.current) return;
                const ctx = canvasRef.current?.getContext("2d");
                if (!ctx) return;
                const pt = getPt(e);
                ctx.lineTo(pt.x, pt.y);
                ctx.stroke();
              }}
              onPointerUp={() => {
                drawingRef.current = false;
              }}
              onPointerLeave={() => {
                drawingRef.current = false;
              }}
              className="relative z-10 h-full w-full touch-none cursor-crosshair"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={clearCanvas}>
              <Eraser className="h-3.5 w-3.5" />
              Xóa viết lại
            </Button>
            <Button
              type="button"
              size="sm"
              variant={showOverlayCompare ? "default" : "outline"}
              onClick={() => setShowOverlayCompare((v) => !v)}
            >
              <Eye className="h-3.5 w-3.5" />
              {showOverlayCompare ? "Ẩn nét đối chiếu" : "So sánh chồng mẫu"}
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Hỗ trợ tập tô và chồng nét mẫu để tự đối chiếu trực quan (không giả lập chấm điểm chữ viết tay tự động).
          </p>
        </div>
      </div>
    </div>
  );
}
