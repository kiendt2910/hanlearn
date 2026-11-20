import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export function LoadingState({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Đang tải dữ liệu"
      className={cn("space-y-3 rounded-lg border border-border bg-surface p-5", className)}
    >
      <Skeleton className="h-5 w-48" />
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="mb-3 rounded-full bg-surface-muted p-3 text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Không thể tải dữ liệu",
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50/70 p-5 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
    >
      <div className="flex items-center gap-2 font-semibold text-sm">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{title}</span>
      </div>
      <p className="text-sm opacity-90">{message}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export type ContentOriginLabel =
  | "VERIFIED_ORIGINAL"
  | "OFFICIAL_LICENSED"
  | "DEMO"
  | "AI_GENERATED";

export function ProvenanceBadge({ origin }: { origin: ContentOriginLabel }) {
  switch (origin) {
    case "VERIFIED_ORIGINAL":
      return <Badge variant="success">Nội dung gốc đã xác minh</Badge>;
    case "OFFICIAL_LICENSED":
      return <Badge variant="default">Bản quyền chính thức</Badge>;
    case "AI_GENERATED":
      return <Badge variant="warning">Gợi ý từ AI</Badge>;
    case "DEMO":
      return <Badge variant="outline">Nội dung mẫu</Badge>;
  }
}
