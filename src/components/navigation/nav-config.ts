export interface NavSubItem {
  label: string;
  href: string;
  description?: string;
}

export interface PrimaryNavItem {
  id: string;
  label: string;
  href: string;
  children?: NavSubItem[];
}

/**
 * Study4-inspired horizontal primary navigation:
 * 8 concise top-level items with clean dropdown menus for secondary modules.
 */
export const PRIMARY_NAV_ITEMS: PrimaryNavItem[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    href: "/dashboard",
  },
  {
    id: "roadmap",
    label: "Lộ trình",
    href: "/roadmap",
    children: [
      {
        label: "Nền tảng từ Con số 0 (Stages 0–7)",
        href: "/foundation",
        description: "Pinyin, 4 thanh điệu, 8 nét chữ & 18 bộ thủ cho người mới",
      },
      {
        label: "Lộ trình học tập",
        href: "/roadmap",
        description: "Nền tảng → HSK 1–6 / HSK 3.0 → Nâng cao",
      },
      {
        label: "Kiểm tra đầu vào",
        href: "/placement-test",
        description: "Xác định cấp độ phù hợp để bắt đầu",
      },
      {
        label: "Khóa học",
        href: "/courses",
        description: "Danh sách khóa học theo từng cấp độ",
      },
    ],
  },
  {
    id: "lessons",
    label: "Bài học",
    href: "/lessons",
    children: [
      {
        label: "Tất cả bài học",
        href: "/lessons",
        description: "Học theo cấu trúc 8 phần chuẩn hóa",
      },
      {
        label: "Kho từ vựng",
        href: "/practice/vocabulary",
        description: "Chữ Hán, Pinyin, nghĩa Việt và âm thanh",
      },
      {
        label: "Ngữ pháp trọng tâm",
        href: "/practice/grammar",
        description: "Mẫu câu, so sánh và lỗi thường gặp",
      },
      {
        label: "Thư viện Offline",
        href: "/offline-library",
        description: "Quản lý bài học & âm thanh đã tải xuống",
      },
    ],
  },
  {
    id: "flashcards",
    label: "Flashcards",
    href: "/flashcards",
  },
  {
    id: "practice",
    label: "Luyện tập",
    href: "/practice",
    children: [
      { label: "Trung tâm luyện tập", href: "/practice" },
      { label: "Luyện Nghe", href: "/practice/listening" },
      { label: "Luyện Nói", href: "/practice/speaking" },
      { label: "Luyện Đọc", href: "/practice/reading" },
      { label: "Luyện Viết & Nét chữ", href: "/practice/writing" },
      { label: "Luyện Phát âm", href: "/practice/pronunciation" },
    ],
  },
  {
    id: "exams",
    label: "Đề thi HSK",
    href: "/exams",
  },
  {
    id: "ai-tutor",
    label: "Gia sư AI",
    href: "/ai-tutor",
    children: [
      {
        label: "Hỏi đáp Gia sư AI",
        href: "/ai-tutor",
        description: "Giải thích từ vựng, ngữ pháp và sửa câu",
      },
      {
        label: "Hội thoại theo chủ đề",
        href: "/ai-tutor/conversation",
        description: "Luyện giao tiếp theo 9 chủ đề thực tế",
      },
    ],
  },
  {
    id: "analytics",
    label: "Thống kê",
    href: "/analytics",
  },
];
