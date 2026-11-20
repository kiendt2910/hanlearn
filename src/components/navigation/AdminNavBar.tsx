"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { canAccessSystemAdmin, type AppRole } from "@/lib/permissions/rbac";
import { cn } from "@/lib/utils/cn";

interface AdminNavBarProps {
  user: {
    name: string;
    email: string;
    roles: AppRole[];
  };
}

const CONTENT_ADMIN_LINKS = [
  { label: "Tổng quan CMS", href: "/admin" },
  { label: "Giáo trình", href: "/admin/curriculum" },
  { label: "Bài học", href: "/admin/lessons" },
  { label: "Từ vựng & Ngữ pháp", href: "/admin/vocabulary" },
  { label: "Ngân hàng câu hỏi", href: "/admin/questions" },
  { label: "Đề thi HSK", href: "/admin/exams" },
  { label: "Âm thanh & Media", href: "/admin/media" },
];

const SYSTEM_ADMIN_LINKS = [
  { label: "Người dùng", href: "/admin/users" },
  { label: "Cấu hình AI", href: "/admin/ai-config" },
  { label: "Cài đặt hệ thống", href: "/admin/settings" },
  { label: "Nhật ký kiểm tra", href: "/admin/audit-logs" },
];

export function AdminNavBar({ user }: AdminNavBarProps) {
  const pathname = usePathname();
  const isSystemAdmin = canAccessSystemAdmin(user.roles);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>HanLearn CMS</span>
          </Link>
          <Badge variant={isSystemAdmin ? "default" : "secondary"}>
            {isSystemAdmin ? "Quản trị viên" : "Biên tập viên"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Giao diện học viên</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="border-t border-border bg-background/70">
        <nav
          aria-label="Điều hướng Quản trị CMS"
          className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6"
        >
          {CONTENT_ADMIN_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}

          {isSystemAdmin ? (
            <>
              <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
              {SYSTEM_ADMIN_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
