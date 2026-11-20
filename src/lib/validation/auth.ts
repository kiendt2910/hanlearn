import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu."),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Tên hiển thị cần tối thiểu 2 ký tự.")
      .max(60, "Tên hiển thị tối đa 60 ký tự."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Vui lòng nhập địa chỉ email hợp lệ.")
      .max(120, "Email tối đa 120 ký tự."),
    password: z
      .string()
      .min(8, "Mật khẩu cần tối thiểu 8 ký tự.")
      .max(72, "Mật khẩu tối đa 72 ký tự.")
      .regex(/[A-Za-z]/, "Mật khẩu cần có ít nhất 1 chữ cái.")
      .regex(/[0-9]/, "Mật khẩu cần có ít nhất 1 chữ số."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
