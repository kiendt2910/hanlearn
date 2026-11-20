import Link from "next/link";
import type { Metadata } from "next";
import {
  BookA,
  BookOpenText,
  FilePenLine,
  Headphones,
  Mic,
  Speech,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Trung tâm luyện tập kỹ năng",
};

const PRACTICE_MODULES = [
  {
    title: "Kho Từ vựng",
    description: "Tra cứu chữ Hán, Pinyin, nghĩa tiếng Việt, lỗi thường gặp và thêm nhanh vào Flashcard.",
    href: "/practice/vocabulary",
    icon: BookA,
  },
  {
    title: "Ngữ pháp trọng tâm",
    description: "Hệ thống mẫu câu giải thích bằng tiếng Việt, so sánh và ví dụ lỗi sai.",
    href: "/practice/grammar",
    icon: BookOpenText,
  },
  {
    title: "Luyện Nghe hiểu",
    description: "Hội thoại thực tế kèm chỉnh tốc độ 0.75x–1.25x, bật/tắt Pinyin và bản dịch.",
    href: "/practice/listening",
    icon: Headphones,
  },
  {
    title: "Luyện Nói phản xạ",
    description: "Nghe mẫu, ghi âm giọng đọc và đối chiếu từng câu giao tiếp.",
    href: "/practice/speaking",
    icon: Speech,
  },
  {
    title: "Luyện Đọc hiểu",
    description: "Đoạn văn phân cấp có đánh dấu từ vựng trọng tâm và bản dịch đối chiếu.",
    href: "/practice/reading",
    icon: BookOpenText,
  },
  {
    title: "Luyện Viết & Nét chữ",
    description: "Tập viết theo thứ tự nét chữ Hán, viết câu/đoạn văn có nhận xét và lịch sử sửa bài.",
    href: "/practice/writing",
    icon: FilePenLine,
  },
  {
    title: "Phòng Luyện Phát âm",
    description: "Luyện 4 thanh điệu + Pinyin, ghi âm so sánh và lưu lịch sử luyện tập trung thực.",
    href: "/practice/pronunciation",
    icon: Mic,
  },
];

export default function PracticeHubPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Trung tâm Luyện tập Kỹ năng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rèn luyện chuyên sâu từng kỹ năng Nghe – Nói – Đọc – Viết – Từ vựng – Ngữ pháp – Phát âm trên cùng kho dữ liệu bài học.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href} className="group block">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardHeader>
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="mt-2 flex items-center justify-between text-base">
                    <span>{mod.title}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
