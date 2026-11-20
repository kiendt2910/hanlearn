"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface VersionItem {
  id: string;
  code: string;
  name: string;
  framework: string;
}

export function CurriculumVersionSwitcher({
  versions,
  activeVersionId,
}: {
  versions: VersionItem[];
  activeVersionId: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const selectVersion = async (versionId: string) => {
    if (versionId === activeVersionId) return;
    setLoadingId(versionId);
    try {
      const res = await fetch("/api/v1/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCurriculumVersionId: versionId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Đã chuyển đổi phiên bản giáo trình.");
      router.refresh();
    } catch {
      toast.error("Không thể cập nhật phiên bản giáo trình.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {versions.map((v) => {
        const active = v.id === activeVersionId;
        return (
          <button
            key={v.id}
            type="button"
            disabled={loadingId !== null}
            onClick={() => selectVersion(v.id)}
            className={cn(
              "rounded-md border px-3 py-2 text-left text-xs transition-colors cursor-pointer",
              active
                ? "border-primary bg-accent text-accent-foreground font-semibold"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            )}
          >
            <div>{v.name}</div>
            <div className="text-[11px] font-normal opacity-80">{v.framework} • {v.code}</div>
          </button>
        );
      })}
    </div>
  );
}
