import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <span
            lang="zh-Hans"
            className="font-hanzi inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
          >
            汉
          </span>
          <span>HanLearn</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <RegisterForm />
      </main>
    </div>
  );
}
