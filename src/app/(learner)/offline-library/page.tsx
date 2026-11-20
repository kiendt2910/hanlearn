import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { OfflineLibraryManager } from "@/modules/offline/components/OfflineLibraryManager";

export const metadata: Metadata = {
  title: "Thư viện học Offline (PWA)",
};

export const dynamic = "force-dynamic";

export default async function OfflineLibraryPage() {
  const lessons = await prisma.lesson.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }],
    select: { id: true, slug: true, titleVi: true, titleZh: true },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Học ngoại tuyến & Đồng bộ PWA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cài đặt HanLearn như ứng dụng PWA, tải bài học vào IndexedDB và đồng bộ tiến độ an toàn khi có kết nối mạng.
        </p>
      </div>

      <OfflineLibraryManager availableLessons={lessons} />
    </div>
  );
}
