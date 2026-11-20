import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, ClipboardCheck, Layers } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Public Topbar */}
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <span
              lang="zh-Hans"
              className="font-hanzi inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
            >
              汉
            </span>
            <span>HanLearn</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">
                  Vào học ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Đăng ký miễn phí</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-5 lg:col-span-7">
            <p className="inline-flex items-center rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Học tiếng Trung bài bản cho người Việt • HSK 2.0 & HSK 3.0
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Hệ sinh thái học tiếng Trung thống nhất từ con số 0 đến chuyên nghiệp
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Bài học 8 phần, từ vựng kèm Pinyin & giải thích tiếng Việt, Flashcard lặp lại ngắt quãng FSRS, phòng thi thử HSK có tính giờ và Gia sư AI — tất cả dùng chung một nền dữ liệu tiến độ.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg" asChild>
                <Link href={user ? "/dashboard" : "/register"}>
                  {user ? "Mở bảng điều khiển" : "Bắt đầu lộ trình học"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {!user ? (
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Tôi đã có tài khoản</Link>
                </Button>
              ) : null}
            </div>
          </div>

          {/* Educational Typography Hierarchy Preview */}
          <Card className="lg:col-span-5">
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Mẫu hiển thị học thuật HanLearn
                </CardTitle>
                <span className="text-xs text-muted-foreground">Chữ Hán • Pinyin • Nghĩa Việt</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="rounded-md border border-border bg-background p-4">
                <div lang="zh-Hans" className="font-hanzi text-2xl font-semibold text-foreground">
                  循序渐进
                </div>
                <div className="font-pinyin mt-1 text-sm font-medium text-primary">
                  xún xù jiàn jìn
                </div>
                <p className="mt-2 text-sm text-foreground">
                  Học tập từng bước theo trình tự, tiến bộ vững chắc.
                </p>
                <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                  Ví dụ: <span lang="zh-Hans" className="font-hanzi text-sm text-foreground">学习汉语需要循序渐进。</span> — Học tiếng Trung cần đi từng bước chắc chắn.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Phân tách trực quan Chữ Hán (Noto Sans SC), Pinyin và giải thích tiếng Việt.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Hỗ trợ chế độ Sáng/Tối và học ngoại tuyến (PWA).</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Core Pillars */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="mt-2 text-sm">Lộ trình phiên bản hóa</CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              Hỗ trợ đồng thời HSK 6 cấp truyền thống và HSK 3.0, từ Nền tảng phát âm đến Thương mại & Học thuật.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle className="mt-2 text-sm">Flashcard FSRS tự động</CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              Tự động tạo thẻ từ từ vựng bài học và câu làm sai, tối ưu lịch ôn tập bằng thuật toán FSRS.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <CardTitle className="mt-2 text-sm">Phòng thi HSK thực tế</CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              Đồng hồ đếm ngược chuẩn hóa từ máy chủ, bảng câu hỏi, chấm điểm kỹ năng và đề xuất ôn tập.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <BrainCircuit className="h-5 w-5 text-primary" />
              <CardTitle className="mt-2 text-sm">Gia sư AI & Luyện kỹ năng</CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-muted-foreground">
              Giải thích ngữ pháp bằng tiếng Việt, sửa câu tự nhiên, luyện hội thoại chủ đề và luyện viết.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
