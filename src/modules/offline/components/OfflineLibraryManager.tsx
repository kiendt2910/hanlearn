"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, Trash2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  flushOfflineSyncQueue,
  getOfflineSyncMeta,
  listOfflineLessonBundles,
  removeOfflineLessonBundle,
  saveOfflineLessonBundle,
  type OfflineLessonBundle,
} from "@/modules/offline/idb-client";

export function OfflineLibraryManager({
  availableLessons,
}: {
  availableLessons: Array<{ id: string; slug: string; titleVi: string; titleZh?: string | null }>;
}) {
  const [bundles, setBundles] = useState<OfflineLessonBundle[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const reloadLocal = async () => {
    const [list, meta] = await Promise.all([
      listOfflineLessonBundles(),
      getOfflineSyncMeta(),
    ]);
    setBundles(list);
    setPendingCount(meta.pendingCount);
    setLastSyncedAt(meta.lastSyncedAt);
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    reloadLocal().catch(() => {});
  }, []);

  const downloadLesson = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/v1/offline/lesson-bundle/${lessonId}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      await saveOfflineLessonBundle(json.data);
      await reloadLocal();
      toast.success("Đã tải bài học vào IndexedDB để học ngoại tuyến.");
    } catch {
      toast.error("Không thể tải bài học.");
    }
  };

  const removeLesson = async (lessonId: string) => {
    await removeOfflineLessonBundle(lessonId);
    await reloadLocal();
    toast.success("Đã xóa gói bài học khỏi bộ nhớ cục bộ.");
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await flushOfflineSyncQueue();
      await reloadLocal();
      toast.success(`Đồng bộ hoàn tất (${res.synced} thay đổi đã gửi, còn ${res.remaining}).`);
    } catch {
      toast.error("Không thể đồng bộ lúc này. Hàng đợi vẫn được giữ an toàn.");
    } finally {
      setSyncing(false);
    }
  };

  const downloadedIds = new Set(bundles.map((b) => b.lessonId));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trạng thái kết nối</CardDescription>
            <CardTitle className="flex items-center gap-2 text-base">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-emerald-600" />
                  Đang trực tuyến
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-amber-600" />
                  Đang ngoại tuyến
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bài học đã lưu Offline (IndexedDB)</CardDescription>
            <CardTitle className="text-2xl">{bundles.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hàng đợi đồng bộ</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Lần cuối: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString("vi-VN") : "Chưa có"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface p-4 text-xs text-muted-foreground">
        <span>
          Lưu ý bảo mật & PWA: Dữ liệu học tập lưu cục bộ trong IndexedDB, tuyệt đối không lưu mã xác thực (token). Gia sư AI yêu cầu kết nối mạng.
        </span>
        <Button type="button" size="sm" onClick={triggerSync} disabled={syncing}>
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          Đồng bộ ngay
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quản lý gói bài học ngoại tuyến</CardTitle>
          <CardDescription>Tải xuống bài học kèm từ vựng và ngữ pháp để xem khi không có mạng.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {availableLessons.map((lesson) => {
            const downloaded = downloadedIds.has(lesson.id);
            return (
              <div
                key={lesson.id}
                className="flex flex-col justify-between gap-2 rounded-md border border-border bg-background p-3 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lessons/${lesson.slug}`}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {lesson.titleVi}
                    </Link>
                    {downloaded ? <Badge variant="success">Đã tải Offline</Badge> : null}
                  </div>
                  {lesson.titleZh ? (
                    <div lang="zh-Hans" className="font-hanzi text-xs text-primary">
                      {lesson.titleZh}
                    </div>
                  ) : null}
                </div>

                {downloaded ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeLesson(lesson.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa bản Offline
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => downloadLesson(lesson.id)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Tải xuống
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
