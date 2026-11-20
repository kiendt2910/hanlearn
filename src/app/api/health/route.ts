import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        service: "hanlearn",
        database: "connected",
        timestamp,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: "hanlearn",
        database: "unreachable",
        timestamp,
      },
      { status: 503 }
    );
  }
}
