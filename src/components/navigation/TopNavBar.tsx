"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Shield,
  User as UserIcon,
  WifiOff,
} from "lucide-react";
import { PRIMARY_NAV_ITEMS } from "@/components/navigation/nav-config";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { PwaSyncIndicator } from "@/components/pwa/PwaSyncIndicator";
import { clearOfflineDatabase } from "@/modules/offline/idb-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { canAccessAdminArea, type AppRole } from "@/lib/permissions/rbac";
import { cn } from "@/lib/utils/cn";

interface TopNavBarProps {
  user: {
    name: string;
    email: string;
    roles: AppRole[];
  };
  unreadNotifications?: number;
}

export function TopNavBar({ user, unreadNotifications = 0 }: TopNavBarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showAdminLink = canAccessAdminArea(user.roles);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const initials = user.name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Mobile drawer trigger + Brand */}
        <div className="flex items-center gap-2.5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetTitle className="flex items-center gap-2 border-b border-border pb-3">
                <span className="font-hanzi inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  汉
                </span>
                <span>HanLearn</span>
              </SheetTitle>

              <nav aria-label="Điều hướng di động" className="mt-4 space-y-1">
                {PRIMARY_NAV_ITEMS.map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-surface-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                    {item.children ? (
                      <div className="ml-3 space-y-0.5 border-l border-border pl-2.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "block rounded-md px-2.5 py-1.5 text-xs transition-colors",
                              pathname === child.href
                                ? "font-medium text-primary"
                                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-foreground focus-visible:rounded-md"
          >
            <span
              lang="zh-Hans"
              className="font-hanzi inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
            >
              汉
            </span>
            <span className="text-base font-bold tracking-tight">HanLearn</span>
          </Link>
        </div>

        {/* Center: Primary horizontal navigation (Desktop) */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-0.5 lg:flex"
        >
          {PRIMARY_NAV_ITEMS.map((item) => {
            const active =
              isActive(item.href) ||
              (item.children?.some((child) => isActive(child.href)) ?? false);

            if (!item.children) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <DropdownMenu key={item.id}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-75" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link href={child.href} className="flex flex-col items-start gap-0.5">
                        <span className="font-medium text-foreground">{child.label}</span>
                        {child.description ? (
                          <span className="text-xs text-muted-foreground">
                            {child.description}
                          </span>
                        ) : null}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>

        {/* Right: Sync Status, Notifications, Theme, Settings, Profile */}
        <div className="flex items-center gap-1">
          <PwaSyncIndicator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
                aria-label="Thông báo"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                {unreadNotifications > 0 ? (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Thông báo học tập</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2.5 py-4 text-center text-xs text-muted-foreground">
                Chưa có thông báo mới. Lịch nhắc ôn tập FSRS và kết quả thi HSK sẽ hiển thị tại đây.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 sm:inline-flex"
            asChild
          >
            <Link href="/settings" aria-label="Cài đặt">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Tài khoản người dùng"
                className="ml-1 flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1 text-left text-sm hover:bg-surface-muted cursor-pointer"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {initials || "HL"}
                </span>
                <span className="hidden max-w-[110px] truncate text-xs font-medium sm:inline">
                  {user.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <UserIcon className="h-4 w-4" />
                  <span>Hồ sơ & Cài đặt</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/offline-library">
                  <WifiOff className="h-4 w-4" />
                  <span>Thư viện Offline</span>
                </Link>
              </DropdownMenuItem>
              {showAdminLink ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">Quản trị CMS</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await clearOfflineDatabase().catch(() => {});
                  signOut({ callbackUrl: "/login" });
                }}
                className="text-red-600 focus:text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
