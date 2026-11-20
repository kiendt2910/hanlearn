"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setServerError(null);
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        const message = payload?.error?.message ?? "Không thể tạo tài khoản. Vui lòng thử lại.";
        setServerError(message);
        toast.error(message);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      toast.success("Tạo tài khoản thành công!");
      if (signInResult && !signInResult.error) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      setServerError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Tạo tài khoản HanLearn</CardTitle>
        <CardDescription>
          Bắt đầu hành trình học tiếng Trung với lộ trình cá nhân hóa và lưu tiến độ tự động.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError ? (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              {serverError}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input
              id="displayName"
              placeholder="Nguyễn Văn Minh"
              {...register("displayName")}
            />
            {errors.displayName ? (
              <p className="text-xs text-red-600">{errors.displayName.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự gồm chữ và số"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Đăng ký tài khoản"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
