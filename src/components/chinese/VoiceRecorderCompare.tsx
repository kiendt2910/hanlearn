"use client";

import { useRef, useState } from "react";
import { Mic, Square, Info, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChineseAudioPlayer } from "@/components/chinese/ChineseAudioPlayer";

interface VoiceRecorderCompareProps {
  targetTextZh: string;
  targetPinyin: string;
  meaningVi?: string;
  referenceAudioUrl?: string | null;
  onSavedAttempt?: () => void;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function VoiceRecorderCompare({
  targetTextZh,
  targetPinyin,
  meaningVi,
  referenceAudioUrl,
  onSavedAttempt,
}: VoiceRecorderCompareProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startRecording = async () => {
    setRecognizedText(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setDurationMs(Date.now() - startTimeRef.current);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Optional browser STT recognition (clearly distinguished from true tone scoring)
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      };
      const SpeechRec = win.SpeechRecognition ?? win.webkitSpeechRecognition;
      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.lang = "zh-CN";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) setRecognizedText(transcript);
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      }
    } catch {
      toast.error("Không thể truy cập micro. Vui lòng cấp quyền micro trong trình duyệt.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const savePracticeAttempt = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/pronunciation/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetTextZh,
          targetPinyin,
          durationMs,
          recognizedTranscriptZh: recognizedText,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Đã lưu lịch sử luyện phát âm.");
      onSavedAttempt?.();
    } catch {
      toast.error("Không thể lưu lượt luyện phát âm.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div>
        <div lang="zh-Hans" className="font-hanzi text-2xl font-semibold text-foreground">
          {targetTextZh}
        </div>
        <div className="font-pinyin mt-0.5 text-sm font-medium text-primary">
          {targetPinyin}
        </div>
        {meaningVi ? (
          <p className="mt-1 text-sm text-muted-foreground">{meaningVi}</p>
        ) : null}
      </div>

      <ChineseAudioPlayer textZh={targetTextZh} audioUrl={referenceAudioUrl} />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <>
              <Square className="h-3.5 w-3.5" />
              Dừng ghi âm
            </>
          ) : (
            <>
              <Mic className="h-3.5 w-3.5" />
              Ghi âm giọng đọc của bạn
            </>
          )}
        </Button>

        {recordedUrl ? (
          <>
            <audio controls src={recordedUrl} className="h-8 max-w-xs" />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={saving}
              onClick={savePracticeAttempt}
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Đang lưu..." : "Lưu lượt luyện"}
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            Nghe mẫu, sau đó ghi âm và phát lại để tự đối chiếu thanh điệu.
          </span>
        )}
      </div>

      {recognizedText ? (
        <div className="rounded-md border border-border bg-background p-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Nhận diện giọng nói (STT)</Badge>
            <span lang="zh-Hans" className="font-hanzi text-sm font-medium text-foreground">
              {recognizedText}
            </span>
          </div>
          <p className="mt-1.5 text-muted-foreground">
            Lưu ý trung thực: Đây là kết quả nhận diện văn bản (Speech-to-Text), không phải chấm điểm thanh điệu chuẩn xác. Hãy nghe lại bản ghi của bạn so với âm thanh mẫu để kiểm tra thanh 1–4.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-md border border-border bg-background/70 p-2.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            Chế độ hiện tại hỗ trợ nghe mẫu, ghi âm đối chiếu và nhận diện giọng nói trình duyệt (nếu hỗ trợ). Chấm điểm thanh điệu chuyên sâu chỉ bật khi quản trị viên kết nối dịch vụ đánh giá phát âm chuyên biệt.
          </span>
        </div>
      )}
    </div>
  );
}
