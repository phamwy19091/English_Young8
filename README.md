# 🎓 English Young 8 — Trang Web Ôn Tập & Luyện Thi Tiếng Anh 8 (Global Success)

Trang web học tập được thiết kế riêng cho học sinh lớp 8 ôn tập kiến thức và luyện đề chuẩn bị cho kì thi **Giữa kì 1 & Cuối kì 1** (bộ sách **Tiếng Anh 8 - Global Success / Kết nối tri thức với cuộc sống**), đồng thời có sẵn khung để mở rộng sang Học kì 2 và các môn học khác (Toán 8, KHTN 8, Ngữ Văn 8...).

---

## 🚀 Cách mở và sử dụng ngay (Không cần cài đặt phức tạp)

Vì bạn muốn một trang web đơn giản, chạy ngay mà không cần cài đặt phần mềm rắc rối:
1. Mở thư mục: `D:\Project\Antigravity\English_Young8`
2. Nháy đúp chuột (Double-click) trực tiếp vào file **`index.html`** để mở bằng trình duyệt **Google Chrome**, **Microsoft Edge** hoặc **Cốc Cốc**.
3. Trang web sẽ hoạt động ngay lập tức 100% tính năng (kể cả loa đọc phát âm tiếng Anh và tự động lưu tiến độ học tập trên trình duyệt)!

---

## 📂 Cấu trúc thư mục dự án

```text
D:\Project\Antigravity\English_Young8\
├── index.html            # Giao diện chính của trang web (Bấm đúp vào đây để mở)
├── css/
│   └── styles.css        # Thiết kế giao diện hiện đại, hỗ trợ cả máy tính & điện thoại
├── js/
│   └── app.js            # Bộ xử lý Flashcard, Phát âm, Phòng thi đếm ngược & Sổ tay câu sai
└── data/
    ├── units_1_3.js      # Dữ liệu Từ vựng, Ngữ âm, Ngữ pháp & Bài tập Unit 1, 2, 3
    ├── units_4_6.js      # Dữ liệu Từ vựng, Ngữ âm, Ngữ pháp & Bài tập Unit 4, 5, 6
    └── exams_hk1.js      # 6 Đề kiểm tra (3 đề 15 phút, 1 đề Giữa kì 1, 2 đề Cuối kì 1)
```

---

## ✨ Nội dung Học kì 1 đã được tạo sẵn đầy đủ

### 1. Trọn bộ 6 Unit Học kì 1 (86 Từ vựng cốt lõi + Ngữ âm + Ngữ pháp + 72 câu bài tập):
- **Unit 1: Leisure Time** — Âm `/ʊ/` và `/uː/`; Động từ chỉ sự yêu thích (`adore, fancy, detest, mind, enjoy + V-ing` vs `like, love, hate, prefer`).
- **Unit 2: Life in the Countryside** — Âm `/ə/` và `/ɪ/`; Cấp so sánh hơn của trạng từ (`faster, earlier, more quickly, more soundly, better, worse...`).
- **Unit 3: Teenagers** — Âm `/ʊə/` và `/ɔɪ/`; Câu đơn (Simple sentences) và Câu ghép (Compound sentences với `FANBOYS` và `however, therefore, otherwise, moreover`).
- **Unit 4: Ethnic Groups of Viet Nam** — Âm `/k/` và `/ɡ/`; Câu hỏi `Wh-questions` và Danh từ đếm được / không đếm được (`information, furniture, advice, sticky rice, livestock, cattle, people...`).
- **Unit 5: Our Customs and Traditions** — Âm `/n/` và `/ŋ/`; Mạo từ `a, an, the` và Không dùng mạo từ (`Zero article Ø`).
- **Unit 6: Lifestyles** — Âm `/br/` và `/pr/`; Thì Tương lai đơn (`will`) và Câu điều kiện loại 1 (`If` / `Unless`).

### 2. Phòng Luyện Đề Thi (6 Đề - Tổng cộng 121 câu hỏi chuẩn cấu trúc):
- **Đề 15 phút số 1** (Unit 1 & Unit 2)
- **Đề 15 phút số 2** (Unit 3 & Unit 4)
- **Đề 15 phút số 3** (Unit 5 & Unit 6)
- **Đề thi Giữa Học kì 1** (25 câu - 45 phút - Tổng hợp Unit 1, 2, 3)
- **Đề thi Cuối Học kì 1 - Đề số 01** (30 câu - 45 phút - Chuẩn cấu trúc đại trà Unit 1–6)
- **Đề thi Cuối Học kì 1 - Đề số 02** (30 câu - 45 phút - Nâng cao & Các bẫy lấy điểm 9–10)

### 3. Sổ Tay Câu Hay Sai (Mistake Notebook):
- Bất kỳ câu nào em của bạn làm sai trong phần Bài tập Unit hoặc Phòng Luyện Đề đều được **tự động gom vào Sổ Tay Câu Sai**.
- Có chế độ **"Làm lại các câu sai"**: khi em làm đúng lại câu đó thì có thể bấm xóa khỏi sổ tay.


---

## 🗄️ Cấu trúc Cơ Sở Dữ Liệu Supabase (15 Bảng Chuẩn)

Dự án đã chuẩn bị sẵn 2 file SQL trong thư mục `supabase/`:
1. **`supabase/schema.sql`**: Thiết kế 15 bảng theo chuẩn LMS EdTech, hỗ trợ đa môn học và đa khối lớp:
   - `grades`, `subjects`, `textbook_series`, `courses`: Danh mục phân cấp không giới hạn.
   - `units`, `lessons`: Cấu trúc bài học.
   - `vocabulary`, `grammar_topics`: Kho tri thức nội dung.
   - `exercises`, `questions`, `question_options`: Hệ thống đề thi và câu hỏi trắc nghiệm.
   - `users`, `study_progress`, `quiz_attempts`, `attempt_answers`: Theo dõi chi tiết từng câu trả lời đúng/sai của học sinh.
2. **`supabase/seed_data.sql`**: Nạp sẵn toàn bộ dữ liệu Tiếng Anh 8 Global Success (Unit 1–6 và 6 đề kiểm tra).

### Các bước nạp vào Supabase (Mất khoảng 1 phút):
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard/project/iiltwryccctzjbfddjcw).
2. Vào mục **SQL Editor** ở thanh menu bên trái.
3. Mở file [schema.sql](file:///D:/Project/Antigravity/English_Young8/supabase/schema.sql), sao chép toàn bộ nội dung và bấm **Run**.
4. Mở tiếp file [seed_data.sql](file:///D:/Project/Antigravity/English_Young8/supabase/seed_data.sql), sao chép toàn bộ nội dung và bấm **Run**.
5. Vào **Project Settings** ➔ **API** ➔ Copy mã **`anon` `public` key**.
6. Mở web [index.html](file:///D:/Project/Antigravity/English_Young8/index.html) ➔ Bấm vào nút màu vàng trên đầu trang **`🟡 Chế độ Cục bộ • Bấm nối Supabase`** ➔ Dán Anon Key và bấm **Lưu & Kiểm tra Kết nối**.

---

## 📊 Phân Hệ Báo Cáo Học Tập & Phân Tích Năng Lực

Truy cập tab **"📊 Báo Cáo Học Tập"** trên thanh menu để:
- Theo dõi 🔥 **Chuỗi ngày học liên tục (Streak)**.
- Xem **Điểm trung bình** và **Tổng số lượt làm bài**.
- Xem biểu đồ **Phân tích năng lực 5 kỹ năng**: Ngữ âm, Từ vựng, Ngữ pháp, Đọc hiểu, Viết lại câu.
- Xem bảng **Nhật ký làm bài chi tiết**: bấm **"👁️ Xem chi tiết"** để xem lại từng câu em đã chọn đúng hay sai, kèm giải thích tiếng Việt.
