"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HanLearn Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md space-y-3 rounded-lg border border-border bg-surface p-6">
        <h1 className="text-lg font-bold text-foreground">Đã xảy ra sự cố tạm thời</h1>
        <p className="text-sm text-muted-foreground">
          Hệ thống gặp lỗi khi tải dữ liệu trang này. Bạn có thể thử tải lại hoặc quay về trang Tổng quan.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Button type="button" onClick={reset}>
            Thử tải lại
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Về Tổng quan</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
