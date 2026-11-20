"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudOff, RefreshCw, Wifi } from "lucide-react";
import { toast } from "sonner";
import {
  flushOfflineSyncQueue,
  getOfflineSyncMeta,
} from "@/modules/offline/idb-client";

export function PwaSyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshMeta = async () => {
    try {
      const meta = await getOfflineSyncMeta();
      setPendingCount(meta.pendingCount);
    } catch {
      // IndexedDB unavailable
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    refreshMeta();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal in restricted contexts
      });
    }

    const handleOnline = async () => {
      setIsOnline(true);
      try {
        setSyncing(true);
        const res = await flushOfflineSyncQueue();
        if (res.synced > 0) {
          toast.success(`Đã đồng bộ ${res.synced} thay đổi học tập ngoại tuyến.`);
        }
        await refreshMeta();
      } catch {
        // Retry later
      } finally {
        setSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info("Bạn đang ở chế độ ngoại tuyến. Tiến độ bài học & Flashcard đã tải sẽ được lưu cục bộ.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && pendingCount === 0 && !syncing) {
    return (
      <Link
        href="/offline-library"
        title="Trạng thái trực tuyến & Thư viện Offline"
        className="hidden items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-surface-muted hover:text-foreground xl:inline-flex"
      >
        <Wifi className="h-3.5 w-3.5 text-emerald-600" />
      </Link>
    );
  }

  return (
    <Link
      href="/offline-library"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-medium text-foreground"
    >
      {syncing ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
      ) : !isOnline ? (
        <CloudOff className="h-3.5 w-3.5 text-amber-600" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5 text-primary" />
      )}
      <span>
        {syncing
          ? "Đang đồng bộ..."
          : !isOnline
          ? `Ngoại tuyến${pendingCount > 0 ? ` (${pendingCount})` : ""}`
          : `Chờ đồng bộ (${pendingCount})`}
      </span>
    </Link>
  );
}
