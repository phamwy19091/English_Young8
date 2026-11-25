# 🎓 English Young 8 — Nền Tảng Ôn Tập & Luyện Thi Tiếng Anh 8 (Global Success)

Ứng dụng web học tập hiện đại dành cho học sinh lớp 8 ôn tập trọn bộ chương trình **Tiếng Anh 8 - Global Success** (Học kì 1, Học kì 2 và đề ôn thi vào lớp 10), tích hợp đồng bộ đám mây **Supabase Auth + Postgres RLS** và tự động triển khai qua **GitHub Actions + Vercel**.

🌐 **Trang web Production:** [https://englishyong8.vercel.app](https://englishyong8.vercel.app)

---

## ✨ Tính Năng Nổi Bật

- **Trọn bộ 12 Unit (Học kì 1 & Học kì 2):** Từ vựng + IPA + phát âm chuẩn Web Speech API, Flashcard 3D, thử thách chính tả (Active Recall Spelling), ngữ âm, ngữ pháp trọng tâm, bài tập trắc nghiệm & tự luận tự chấm.
- **Phòng Luyện Đề Thi Bấm Giờ:** Đề 15 phút, Giữa kì, Cuối kì (HK1 & HK2) và bộ đề ôn thi vào lớp 10 với trộn câu hỏi/đáp án, khung đọc hiểu cố định và xem lại chi tiết bài làm.
- **Sổ Tay Câu Hay Sai (Mistake Notebook):** Tự động thu thập câu sai, làm lại không lộ đáp án và tự xóa khi đã trả lời đúng.
- **Edutainment Game Hub:** 5 mini-game tương tác 2D giúp ôn từ vựng/ngữ pháp kèm điểm XP, hạng và huy hiệu.
- **Báo Cáo & Phân Tích Năng Lực:** Chuỗi ngày học (Streak), radar 5 kỹ năng và nhật ký làm bài.
- **Cổng Quản Trị (Admin Portal):** Theo dõi học sinh, giao bài tập, quản lý ngân hàng câu hỏi và **Trình tạo đề thi xuất file Word (.doc) / in PDF**.
- **Bảo Mật Chuẩn Public:** Xác thực bằng **Supabase Auth**, phân quyền `admin` qua server-controlled `app_metadata`, siết chặt Row Level Security (RLS) trên Postgres và bảo vệ xuất HTML khỏi XSS.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** Vite 6, React 19, TypeScript 5.8, Tailwind CSS 3, Lucide Icons
- **Backend & Database:** Supabase (PostgreSQL 17, Supabase Auth, Row Level Security)
- **Kiểm thử & CI/CD:** Vitest (332+ unit tests), E2E Acceptance Suite (524 tests), GitHub Actions (`.github/workflows/ci.yml`), Vercel Auto-Deploy

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Development)

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình biến môi trường
Sao chép file mẫu `.env.example` thành `.env.local` và điền thông tin Supabase của bạn:
```bash
cp .env.example .env.local
```
Các biến cần thiết:
- `VITE_SUPABASE_URL`: Đường dẫn dự án Supabase (`https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Khóa **Publishable Key** (`sb_publishable_...`) — *tuyệt đối không dùng `sb_secret_` hoặc `service_role` ở frontend*
- `VITE_ENABLE_DEMO_ADMIN`: `false` trên production

### 3. Chạy ứng dụng & Kiểm thử
```bash
npm run dev              # Chạy môi trường phát triển
npm test                 # Chạy bộ Unit Test (Vitest)
node tests/e2e/runner.js # Chạy bộ E2E Acceptance Suite
npm run build            # Kiểm tra TypeScript (tsc) và build production
```

---

## 📂 Cấu Trúc Thư Mục Chính

```text
English_Young8/
├── .github/workflows/ci.yml   # GitHub Actions CI (typecheck, test, build)
├── AGENTS.md                  # Bộ quy chuẩn phát triển Vibe Coding (10 giai đoạn)
├── src/
│   ├── components/            # Giao diện (auth, dashboard, practice, exam, games, admin...)
│   ├── context/               # AuthContext, StudyContext, MistakeContext
│   ├── data/                  # Dữ liệu 12 Units & ngân hàng đề thi
│   ├── services/              # supabaseService, storageService, speechService, testExportService...
│   ├── tests/unit/            # Bộ kiểm thử đơn vị (Vitest)
│   └── types/                 # Định nghĩa kiểu TypeScript
├── supabase/
│   ├── schema.sql             # Database schema + RLS policies chuẩn production
│   └── seed_data.sql          # Dữ liệu mẫu chương trình học
└── tests/e2e/                 # Bộ kiểm thử chấp nhận E2E
```
