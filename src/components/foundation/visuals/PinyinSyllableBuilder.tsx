"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const INITIALS = ["b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "zh", "ch", "sh", "z", "c", "s"];
const FINALS = ["a", "o", "e", "i", "u", "ü", "ai", "ao", "an", "ang", "ou"];
const TONES = [
  { id: 1, label: "Thanh 1 (ˉ)" },
  { id: 2, label: "Thanh 2 (ˊ)" },
  { id: 3, label: "Thanh 3 (ˇ)" },
  { id: 4, label: "Thanh 4 (ˋ)" },
];

const VOWEL_TONES: Record<string, [string, string, string, string]> = {
  a: ["ā", "á", "ǎ", "à"],
  o: ["ō", "ó", "ǒ", "ò"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

function applyToneMark(final: string, tone: number, dropUmlaut: boolean): string {
  const idx = tone - 1;
  let target = final;
  if (dropUmlaut) {
    target = target.replace("ü", "u");
  }
  const priority = ["a", "o", "e", "u", "i", "ü"];
  for (const ch of priority) {
    if (target.includes(ch) && VOWEL_TONES[ch]) {
      return target.replace(ch, VOWEL_TONES[ch][idx]);
    }
  }
  return target;
}

function evaluateCombination(initial: string, final: string, tone: number) {
  const isJQX = ["j", "q", "x"].includes(initial);
  const isBPMF = ["b", "p", "m", "f"].includes(initial);

  // Common invalid beginner traps explained clearly
  if (isJQX && !["i", "ü"].includes(final)) {
    return {
      valid: false,
      syllable: `${initial} + ${final}`,
      ruleVi: `Nhóm mặt lưỡi j, q, x KHÔNG ghép trực tiếp với "${final}" — chúng chỉ ghép với vận mẫu bắt đầu bằng i hoặc ü.`,
    };
  }
  if (!isJQX && !["n", "l"].includes(initial) && final === "ü") {
    return {
      valid: false,
      syllable: `${initial} + ${final}`,
      ruleVi: `Vận mẫu ü chỉ ghép với n, l (giữ hai chấm: nü, lü) và j, q, x (bỏ hai chấm: ju, qu, xu).`,
    };
  }
  if (final === "o" && !isBPMF) {
    return {
      valid: false,
      syllable: `${initial} + ${final}`,
      ruleVi: `Vận mẫu đơn "o" đứng một mình chủ yếu ghép với nhóm môi b, p, m, f (bo, po, mo, fo); các âm khác dùng "uo".`,
    };
  }
  if (["g", "k", "h"].includes(initial) && final === "i") {
    return {
      valid: false,
      syllable: `${initial} + ${final}`,
      ruleVi: `Nhóm cuống lưỡi g, k, h không ghép với "i".`,
    };
  }

  const dropUmlaut = isJQX && final === "ü";
  const markedFinal = applyToneMark(final, tone, dropUmlaut);
  const syllable = `${initial}${markedFinal}`;

  const ruleVi = dropUmlaut
    ? `Quy tắc chính tả quan trọng: Sau j, q, x thì "ü" bỏ dấu hai chấm viết thành "${syllable}", nhưng miệng VẪN chu tròn đọc âm ü!`
    : `Ghép hợp lệ: ${initial} + ${final} + Thanh ${tone} → ${syllable}.`;

  return { valid: true, syllable, ruleVi };
}

export function PinyinSyllableBuilder() {
  const [initial, setInitial] = useState("m");
  const [final, setFinal] = useState("a");
  const [tone, setTone] = useState(1);

  const result = evaluateCombination(initial, final, tone);

  const speakPreview = () => {
    if (!result.valid || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(result.syllable);
    u.lang = "zh-CN";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Bảng Ghép âm Pinyin Tương tác (Thanh mẫu + Vận mẫu + Thanh điệu)
        </h3>
        <p className="text-xs text-muted-foreground">
          Thử ghép bất kỳ cặp nào để kiểm tra tính hợp lệ và quy tắc viết tắt chính tả (`j/q/x + ü`).
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">1. Chọn Thanh mẫu:</div>
        <div className="flex flex-wrap gap-1">
          {INITIALS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInitial(i)}
              className={cn(
                "rounded border px-2.5 py-1 text-xs font-semibold cursor-pointer",
                initial === i
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface hover:bg-surface-muted"
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">2. Chọn Vận mẫu:</div>
        <div className="flex flex-wrap gap-1">
          {FINALS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFinal(f)}
              className={cn(
                "rounded border px-2.5 py-1 text-xs font-semibold cursor-pointer",
                final === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface hover:bg-surface-muted"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">3. Chọn Thanh điệu:</div>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className={cn(
                "rounded border px-2.5 py-1 text-xs font-medium cursor-pointer",
                tone === t.id
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-surface hover:bg-surface-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-md border p-4",
          result.valid
            ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30"
            : "border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30"
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-pinyin text-2xl font-bold text-foreground">
              {result.syllable}
            </span>
            <Badge variant={result.valid ? "success" : "warning"}>
              {result.valid ? "Âm tiết hợp lệ" : "Không ghép trực tiếp"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-foreground">{result.ruleVi}</p>
        </div>

        {result.valid ? (
          <Button type="button" size="sm" variant="outline" onClick={speakPreview}>
            <Volume2 className="h-4 w-4" />
            Nghe âm ghép
          </Button>
        ) : null}
      </div>
    </div>
  );
}
