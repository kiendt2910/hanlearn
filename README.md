# HanLearn — Nền tảng học tiếng Trung toàn diện cho người Việt (PWA)

Hệ sinh thái học tiếng Trung dạng **Modular Monolith** (Next.js App Router + PostgreSQL + Prisma ORM + Auth.js v5 + Tailwind CSS / shadcn/ui), thiết kế học thuật tối giản lấy cảm hứng từ Study4.

## 19 Phân hệ đã triển khai đầy đủ

1. **Dashboard (`/dashboard`)** — Tiến độ bài học tiếp theo, thẻ FSRS đến hạn, chuỗi ngày học, năng lực kỹ năng, lịch sử đề thi.
2. **Lộ trình phiên bản hóa (`/roadmap`, `/placement-test`)** — Hỗ trợ song song khung **HSK 6 cấp truyền thống** và **HSK 3.0** cấu hình độc lập, từ Nền tảng → HSK 1–6 → Nâng cao, Thương mại, Học thuật; có kiểm tra đầu vào.
3. **Khóa học (`/courses`, `/courses/[slug]`)** — Giáo trình theo chương, điều kiện tiên quyết, tiến độ khóa học.
4. **Trình học bài 8 phần (`/lessons`, `/lessons/[slug]`)** — Mục tiêu, Từ vựng, Ngữ pháp, Nghe, Nói, Đọc, Viết nét chữ, Kiểm tra cuối bài; bật/tắt Pinyin & Dịch Việt, tải Offline, tạo Flashcard tự động.
5. **Từ vựng (`/practice/vocabulary`)** — Chữ Hán giản thể, Pinyin dấu thanh, nghĩa Việt/Anh, ví dụ, lỗi thường gặp, âm thanh, đánh dấu.
6. **Ngữ pháp (`/practice/grammar`)** — Giải thích tiếng Việt, mẫu câu, đối chiếu, ví dụ đúng/sai.
7. **Nghe (`/practice/listening`)** — Hội thoại có chỉnh tốc độ `0.75x–1.25x` và lời thoại.
8. **Nói (`/practice/speaking`)** — Nghe và nhắc lại kèm ghi âm đối chiếu.
9. **Đọc (`/practice/reading`)** — Đoạn văn phân cấp kèm từ khóa trọng tâm và bản dịch.
10. **Viết (`/practice/writing`)** — Khung luyện thứ tự nét chữ Hán (SVG + canvas vẽ tay), viết câu/đoạn văn, góp ý ngữ pháp tiếng Việt và chuỗi lịch sử sửa bài (Revision).
11. **Bài tập (`/api/v1/exercises/[id]/submit`)** — Chấm điểm phía máy chủ (trắc nghiệm, điền từ, sắp xếp câu, nghe, dịch), không lộ đáp án trước khi nộp, tự tạo Flashcard từ câu sai.
12. **Flashcards FSRS (`/flashcards`, `/flashcards/review`, `/flashcards/decks/[id]`)** — Thuật toán `ts-fsrs`, chống trùng thẻ từ cùng nguồn (`flashcard_sources`), phím tắt `Space` / `1–4`, nhập/xuất JSON.
13. **Phòng thi HSK (`/exams`, `/exams/[slug]`, `/exams/attempts/[attemptId]`)** — Đồng hồ đếm ngược kiểm soát từ máy chủ, tự động nộp khi hết giờ, bảng câu hỏi, đánh dấu xem lại, đề tùy chỉnh, phân tích kỹ năng & giải thích chi tiết.
14. **Gia sư AI (`/ai-tutor`)** — Độc lập nhà cung cấp (OpenAI-compatible / Google Gemini), kiểm soát giới hạn ngày, lưu lịch sử & cho phép xóa.
15. **Hội thoại chủ đề (`/ai-tutor/conversation`)** — 9 chủ đề thực tế theo trình độ.
16. **Phát âm (`/practice/pronunciation`)** — Nghe mẫu, ghi âm đối chiếu, nhận diện STT tùy chọn kèm thông báo trung thực tách biệt STT với chấm điểm thanh điệu.
17. **Thống kê (`/analytics`)** — Chuỗi học, độ thành thạo kỹ năng, phân bổ FSRS, lịch sử thi HSK.
18. **PWA & Học Offline (`/offline-library`)** — Web Manifest, Service Worker, IndexedDB (không lưu token xác thực), tải gói bài học ngoại tuyến, đồng bộ hàng đợi bất biến (`clientMutationId`).
19. **Quản trị CMS (`/admin/*`)** — Phân quyền chặt chẽ giữa `CONTENT_EDITOR` (quản lý nội dung, Draft/Publish/Archive) và `ADMIN` (người dùng, cấu hình AI, cài đặt hệ thống, nhật ký kiểm tra).

## Tài khoản mẫu (Môi trường phát triển)

- **Admin**: `admin@hanlearn.local` / `Admin@123456`
- **Content Editor**: `editor@hanlearn.local` / `Editor@123456`
- **Learner**: `learner@hanlearn.local` / `Learner@123456`

## Lệnh vận hành & Kiểm thử

```bash
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run start
```
