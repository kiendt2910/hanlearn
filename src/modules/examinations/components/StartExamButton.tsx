"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function StartExamButton({
  examTemplateId,
  label = "Bắt đầu làm bài thi",
}: {
  examTemplateId: string;
  label?: string;
}) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/v1/exams/${examTemplateId}/start`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      router.push(`/exams/attempts/${json.data.id}`);
    } catch {
      toast.error("Không thể khởi tạo phiên thi.");
      setStarting(false);
    }
  };

  return (
    <Button type="button" onClick={handleStart} disabled={starting}>
      <Play className="h-4 w-4" />
      {starting ? "Đang vào phòng thi..." : label}
    </Button>
  );
}
