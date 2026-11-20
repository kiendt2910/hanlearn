import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Thư viện Âm thanh & Media ({assets.length})</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý tài nguyên âm thanh phát âm bản xứ, hình ảnh minh họa và tài liệu bài học.
        </p>
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Chưa có tệp media tải lên riêng. Các bài học sơ cấp hiện đang sử dụng phát âm chuẩn TTS Tiếng Phổ thông (zh-CN) tích hợp cho đến khi biên tập viên tải tệp ghi âm phòng thu.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {assets.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between p-3 text-xs">
                <div>
                  <span className="font-medium">{a.storageKey}</span> ({a.mimeType})
                </div>
                <Badge variant="outline">{a.mediaType}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
