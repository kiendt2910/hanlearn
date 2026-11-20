import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(
  message: string,
  status = 400,
  code = "BAD_REQUEST",
  details?: unknown
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status }
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return apiError(error.message, error.statusCode, error.code, error.details);
  }
  if (error instanceof ZodError) {
    return apiError(
      "Dữ liệu đầu vào không hợp lệ.",
      422,
      "VALIDATION_ERROR",
      error.flatten().fieldErrors
    );
  }
  console.error("[HanLearn API Error]", error);
  return apiError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.", 500, "INTERNAL_SERVER_ERROR");
}
