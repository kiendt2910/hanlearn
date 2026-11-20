"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ContentStatusSelect({
  entityType,
  entityId,
  currentStatus,
}: {
  entityType: "lesson" | "course" | "vocabulary" | "grammar" | "exam";
  entityId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const onChange = async (nextStatus: string) => {
    setStatus(nextStatus);
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/content/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Đã cập nhật trạng thái sang ${nextStatus}.`);
      router.refresh();
    } catch {
      setStatus(currentStatus);
      toast.error("Không thể cập nhật trạng thái nội dung.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      disabled={saving}
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-border bg-surface px-2 text-xs font-medium"
    >
      <option value="DRAFT">DRAFT (Nháp)</option>
      <option value="IN_REVIEW">IN_REVIEW (Chờ duyệt)</option>
      <option value="PUBLISHED">PUBLISHED (Xuất bản)</option>
      <option value="ARCHIVED">ARCHIVED (Lưu trữ)</option>
    </select>
  );
}
