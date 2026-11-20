import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md space-y-3 rounded-lg border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">404</p>
        <h1 className="text-xl font-bold text-foreground">Không tìm thấy trang</h1>
        <p className="text-sm text-muted-foreground">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển trong hệ thống HanLearn.
        </p>
        <div className="pt-2">
          <Button asChild>
            <Link href="/dashboard">Về trang Tổng quan</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
