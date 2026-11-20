"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CharacterStrokeItem {
  strokeOrder: number;
  svgPath: string;
  strokeName?: string | null;
}

interface HanziStrokeCanvasProps {
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  mnemonicVi?: string | null;
  strokes: CharacterStrokeItem[];
}

export function HanziStrokeCanvas({
  hanzi,
  pinyin,
  meaningVi,
  mnemonicVi,
  strokes,
}: HanziStrokeCanvasProps) {
  const [visibleStrokes, setVisibleStrokes] = useState(strokes.length);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    setVisibleStrokes(strokes.length);
  }, [hanzi, strokes.length]);

  useEffect(() => {
    if (!isAnimating) return;
    if (visibleStrokes >= strokes.length) {
      setIsAnimating(false);
      return;
    }
    const timer = setTimeout(() => {
      setVisibleStrokes((v) => v + 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [isAnimating, visibleStrokes, strokes.length]);

  const replayAnimation = () => {
    setVisibleStrokes(0);
    setIsAnimating(true);
  };

  const stepStroke = () => {
    setIsAnimating(false);
    setVisibleStrokes((v) => (v >= strokes.length ? 1 : v + 1));
  };

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1D4ED8";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-baseline gap-3">
          <span lang="zh-Hans" className="font-hanzi text-3xl font-bold text-foreground">
            {hanzi}
          </span>
          <span className="font-pinyin text-sm font-medium text-primary">{pinyin}</span>
          <span className="text-sm text-muted-foreground">{meaningVi}</span>
        </div>
        <span className="text-xs text-muted-foreground">{strokes.length} nét</span>
      </div>

      {mnemonicVi ? (
        <p className="mt-2 text-xs text-muted-foreground">Mẹo nhớ: {mnemonicVi}</p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Animated Stroke Order Guide */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Thứ tự nét mẫu ({Math.min(visibleStrokes, strokes.length)}/{strokes.length})
          </span>
          <svg
            viewBox="0 0 100 100"
            className="h-44 w-44 rounded-md border border-border bg-background"
          >
            {/* Tianzige grid */}
            <line x1="50" y1="0" x2="50" y2="100" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="0.6" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="0.6" />
            {strokes.map((st, idx) => (
              <path
                key={st.strokeOrder}
                d={st.svgPath}
                fill="none"
                stroke={idx < visibleStrokes ? "#0F172A" : "#E2E8F0"}
                className={idx < visibleStrokes ? "dark:stroke-slate-100" : "dark:stroke-slate-700"}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={replayAnimation}>
              <Play className="h-3.5 w-3.5" />
              Chạy nét
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={stepStroke}>
              <SkipForward className="h-3.5 w-3.5" />
              Từng nét
            </Button>
          </div>
        </div>

        {/* Interactive Drawing Practice Canvas */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Khung tập viết tay (Chuột / Cảm ứng)
          </span>
          <div className="relative h-44 w-44 overflow-hidden rounded-md border border-border bg-background">
            <span
              lang="zh-Hans"
              aria-hidden="true"
              className="font-hanzi pointer-events-none absolute inset-0 flex select-none items-center justify-center text-8xl text-slate-200 dark:text-slate-800"
            >
              {hanzi}
            </span>
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="relative z-10 h-full w-full touch-none cursor-crosshair"
            />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={clearCanvas}>
            <Eraser className="h-3.5 w-3.5" />
            Xóa khung viết
          </Button>
        </div>
      </div>
    </div>
  );
}
