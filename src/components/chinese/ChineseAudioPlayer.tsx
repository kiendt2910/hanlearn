"use client";

import { useRef, useState } from "react";
import { RotateCcw, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ChineseAudioPlayerProps {
  textZh: string;
  audioUrl?: string | null;
  compact?: boolean;
  defaultSpeed?: number;
  className?: string;
}

const SPEEDS = [0.75, 1.0, 1.25];

export function ChineseAudioPlayer({
  textZh,
  audioUrl,
  compact = false,
  defaultSpeed = 1.0,
  className,
}: ChineseAudioPlayerProps) {
  const [speed, setSpeed] = useState(defaultSpeed);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playAudio = () => {
    stopPlayback();

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = speed;
      audioRef.current = audio;
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        playSpeechSynthesis();
      };
      audio.play().catch(() => {
        setIsPlaying(false);
        playSpeechSynthesis();
      });
      return;
    }

    playSpeechSynthesis();
  };

  const playSpeechSynthesis = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(textZh);
    utterance.lang = "zh-CN";
    utterance.rate = speed;
    const voices = window.speechSynthesis.getVoices();
    const zhVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith("zh-cn")) ??
      voices.find((v) => v.lang.toLowerCase().startsWith("zh"));
    if (zhVoice) utterance.voice = zhVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  if (compact) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={isPlaying ? stopPlayback : playAudio}
        aria-label={`Nghe phát âm ${textZh}`}
        className={cn("h-7 gap-1.5 px-2 text-xs", className)}
      >
        {isPlaying ? <Square className="h-3 w-3" /> : <Volume2 className="h-3.5 w-3.5" />}
        <span>{isPlaying ? "Dừng" : "Nghe"}</span>
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2",
        className
      )}
    >
      <Button
        type="button"
        size="sm"
        variant={isPlaying ? "secondary" : "default"}
        onClick={isPlaying ? stopPlayback : playAudio}
      >
        {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        <span>{isPlaying ? "Dừng phát" : "Phát âm thanh"}</span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={playAudio}
        aria-label="Phát lại"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span className="text-xs">Lặp lại</span>
      </Button>

      <div className="flex items-center gap-1 border-l border-border pl-2">
        <span className="text-xs text-muted-foreground">Tốc độ:</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeed(s)}
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-medium cursor-pointer",
              speed === s
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface-muted"
            )}
          >
            {s}x
          </button>
        ))}
      </div>

      <span className="ml-auto text-[11px] text-muted-foreground">
        {audioUrl ? "Âm thanh chuẩn" : "TTS Tiếng Phổ thông (zh-CN)"}
      </span>
    </div>
  );
}
