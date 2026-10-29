-- ==============================================================================
-- DATABASE SCHEMA: HỆ THỐNG HỌC TẬP & LUYỆN THI (ENGLISH YOUNG 8 & MULTI-SUBJECT)
-- Nền tảng: PostgreSQL (Supabase)
-- Tối ưu: Nhiều môn học, Nhiều khối lớp, Nhiều bộ sách giáo khoa
-- ==============================================================================

-- 1. KÍCH HOẠT EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. HỆ THỐNG DANH MỤC CẤU TRÚC (GRADES -> SUBJECTS -> TEXTBOOK_SERIES -> COURSES)
-- ==============================================================================

-- 2.1. Khối lớp (Grades: 6, 7, 8, 9...)
CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,                       -- e.g. 'grade-8'
    name TEXT NOT NULL,                        -- e.g. 'Lớp 8'
    level INT NOT NULL UNIQUE,                 -- e.g. 8
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2. Môn học (Subjects: Tiếng Anh, Toán, Khoa học tự nhiên...)
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,                       -- e.g. 'english', 'math', 'science'
    name TEXT NOT NULL,                        -- e.g. 'Tiếng Anh'
    code TEXT NOT NULL UNIQUE,                 -- e.g. 'ENG'
    icon TEXT,                                 -- e.g. '🇬🇧'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3. Bộ sách giáo khoa (Textbook Series: Global Success, Cánh Diều, Chân Trời Sáng Tạo...)
CREATE TABLE IF NOT EXISTS textbook_series (
    id TEXT PRIMARY KEY,                       -- e.g. 'global-success', 'canh-dieu'
    name TEXT NOT NULL,                        -- e.g. 'Global Success (Kết nối tri thức)'
    publisher TEXT,                            -- e.g. 'NXB Giáo Dục Việt Nam'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4. Khóa học / Chương trình học (Courses: Ghép Khối lớp + Môn học + Bộ sách)
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,                       -- e.g. 'course-eng-8-gs'
    grade_id TEXT NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    series_id TEXT NOT NULL REFERENCES textbook_series(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,                       -- e.g. 'Tiếng Anh 8 - Global Success'
    description TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. CẤU TRÚC BÀI HỌC THEO KHÓA HỌC (UNITS -> LESSONS)
-- ==============================================================================

-- 3.1. Các Unit / Chương học (Units: Unit 1 đến Unit 12 & Review)
CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,                       -- e.g. 'unit-1', 'unit-2'
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_number INT NOT NULL,                  -- 1, 2, 3...
    semester INT NOT NULL DEFAULT 1,           -- 1 hoặc 2
    title TEXT NOT NULL,                       -- 'Leisure Time'
    vi_title TEXT NOT NULL,                    -- 'Thời gian rảnh rỗi'
    summary TEXT,
    icon TEXT DEFAULT '📖',
    color TEXT DEFAULT '#4F46E5',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2. Bài học chi tiết trong Unit (Lessons)
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,                       -- e.g. 'u1-lesson-vocab', 'u1-lesson-grammar'
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,                       -- e.g. 'Từ vựng & Phát âm', 'Ngữ pháp trọng tâm'
    lesson_type TEXT NOT NULL,                 -- 'vocabulary', 'grammar', 'pronunciation', 'practice', 'skills'
    order_index INT DEFAULT 1,
    content_json JSONB DEFAULT '{}'::jsonb,    -- Dữ liệu nội dung mở rộng
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. KHO KIẾN THỨC NỘI DUNG (VOCABULARY & GRAMMAR_TOPICS)
-- ==============================================================================

-- 4.1. Từ vựng (Vocabulary)
CREATE TABLE IF NOT EXISTS vocabulary (
    id TEXT PRIMARY KEY,                       -- e.g. 'u1-v1'
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,
    word TEXT NOT NULL,                        -- e.g. 'leisure'
    ipa TEXT,                                  -- e.g. '/ˈleʒə(r)/'
    word_type TEXT,                            -- e.g. 'n', 'v', 'adj', 'phr.v'
    meaning TEXT NOT NULL,                     -- e.g. 'thời gian rảnh rỗi, sự giải trí'
    example TEXT,                              -- e.g. 'What do you often do in your leisure time?'
    example_vi TEXT,                           -- Dịch nghĩa câu ví dụ
    tip TEXT,                                  -- Mẹo ghi nhớ / bẫy thi
    audio_url TEXT,                            -- Link file audio (nếu có)
    order_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2. Chủ điểm ngữ pháp (Grammar Topics)
CREATE TABLE IF NOT EXISTS grammar_topics (
    id TEXT PRIMARY KEY,                       -- e.g. 'u1-g1'
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,
    topic_title TEXT NOT NULL,                 -- e.g. 'Động từ chỉ sự yêu thích (Verbs of liking)'
    formula TEXT,                              -- Công thức: S + like/love/enjoy + V-ing
    explanation TEXT,                          -- Giải thích chi tiết
    examples_json JSONB DEFAULT '[]'::jsonb,   -- Mảng các ví dụ minh họa
    exam_traps TEXT,                           -- Các bẫy đề thi hay gặp
    order_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. HỆ THỐNG ĐỀ THI & BÀI TẬP (EXERCISES -> QUESTIONS -> QUESTION_OPTIONS)
-- ==============================================================================

-- 5.1. Bộ bài tập hoặc đề kiểm tra (Exercises)
-- Hỗ trợ cả: Bài tập theo Lesson, Bài tập theo Unit, và Đề thi tổng hợp Giữa kì / Cuối kì theo Course
CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,                       -- e.g. 'quiz-unit-1', 'exam-15m-1', 'exam-midterm-1', 'exam-final-1'
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,       -- Nullable đối với đề Giữa kì/Cuối kì
    lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,   -- Nullable đối với đề tổng hợp
    title TEXT NOT NULL,                                       -- Tên đề kiểm tra
    category TEXT NOT NULL,                                    -- 'unit_quiz', '15m', 'midterm', 'final'
    badge TEXT,                                                -- Nhãn hiển thị: '15 Phút', 'Giữa Kì 1', 'Cuối Kì 1'
    duration_minutes INT NOT NULL DEFAULT 15,                  -- Thời gian làm bài (phút)
    scope TEXT,                                                -- Phạm vi kiến thức
    description TEXT,                                          -- Mô tả tóm tắt
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2. Ngân hàng câu hỏi (Questions)
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,                       -- e.g. 'u1_q1', 'e15_1_q1', 'final_q1'
    exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    section TEXT,                              -- 'I. Pronunciation', 'II. Vocabulary & Grammar', 'III. Reading'...
    question_text TEXT NOT NULL,               -- Nội dung đề bài
    question_type TEXT DEFAULT 'multiple_choice', -- 'multiple_choice', 'fill_in_blank', 'rewrite'
    explanation TEXT,                          -- Lời giải chi tiết tiếng Việt
    order_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3. Các phương án trả lời (Question Options)
CREATE TABLE IF NOT EXISTS question_options (
    id TEXT PRIMARY KEY,                       -- e.g. 'e15_1_q1_opt0', 'e15_1_q1_opt1'
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_index INT NOT NULL,                 -- 0, 1, 2, 3 (A, B, C, D)
    option_text TEXT NOT NULL,                 -- 'A. pudding'
    is_correct BOOLEAN NOT NULL DEFAULT FALSE, -- Đáp án đúng
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. HỆ THỐNG NGƯỜI DÙNG & THEO DÕI HỌC TẬP (USERS -> PROGRESS -> ATTEMPTS -> ANSWERS)
-- ==============================================================================

-- 6.1. Hồ sơ người dùng / Học sinh (Users / Profiles)
-- Tích hợp linh hoạt: có thể liên kết auth.users hoặc dùng UUID/Username độc lập
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',      -- 'student', 'parent', 'admin'
    pin_code TEXT,                             -- Mã PIN 4 số đăng nhập nhanh cho học sinh
    avatar_url TEXT,
    streak_days INT DEFAULT 0,                 -- Chuỗi ngày học liên tục
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.2. Tiến độ học từ vựng của từng học sinh (Study Progress)
CREATE TABLE IF NOT EXISTS study_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id TEXT NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'learning',   -- 'learning' (đang học/cần ôn) | 'mastered' (đã thuộc)
    review_count INT DEFAULT 1,                -- Số lần đã lật ôn từ này
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_vocab UNIQUE (user_id, vocabulary_id)
);

-- 6.3. Lần làm bài kiểm tra / Đề thi (Quiz Attempts)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    score NUMERIC(4, 2) NOT NULL,              -- Điểm thang 10 (ví dụ: 8.50, 10.00)
    raw_score INT NOT NULL,                    -- Số câu làm đúng (ví dụ: 25)
    total_questions INT NOT NULL,              -- Tổng số câu hỏi (ví dụ: 30)
    time_spent_seconds INT NOT NULL,           -- Thời gian hoàn thành (giây)
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.4. Chi tiết câu trả lời của học sinh trong từng lần làm bài (Attempt Answers)
-- CỰC KỲ QUAN TRỌNG: Cho phép phụ huynh xem lại bài làm chi tiết & tự động lọc câu sai
CREATE TABLE IF NOT EXISTS attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_index INT,                 -- Vị trí phương án học sinh chọn (0, 1, 2, 3)
    is_correct BOOLEAN NOT NULL,               -- Đúng hay sai
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. CHỈ MỤC (INDEXES) TỐI ƯU TỐC ĐỘ TRUY VẤN
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_units_course ON units(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_vocab_unit ON vocabulary(unit_id);
CREATE INDEX IF NOT EXISTS idx_grammar_unit ON grammar_topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_exercises_course ON exercises(course_id);
CREATE INDEX IF NOT EXISTS idx_exercises_unit ON exercises(unit_id);
CREATE INDEX IF NOT EXISTS idx_questions_exercise ON questions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON attempt_answers(question_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) - BẢO MẬT TRÊN SUPABASE
-- ==============================================================================
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE textbook_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai nội dung học tập và đề thi
CREATE POLICY "Public Read Catalog" ON grades FOR SELECT USING (true);
CREATE POLICY "Public Read Subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public Read Textbooks" ON textbook_series FOR SELECT USING (true);
CREATE POLICY "Public Read Courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public Read Units" ON units FOR SELECT USING (true);
CREATE POLICY "Public Read Lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Public Read Vocabulary" ON vocabulary FOR SELECT USING (true);
CREATE POLICY "Public Read Grammar" ON grammar_topics FOR SELECT USING (true);
CREATE POLICY "Public Read Exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Public Read Questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public Read Question Options" ON question_options FOR SELECT USING (true);

-- Cho phép đọc và ghi dữ liệu học tập của học sinh (hỗ trợ cả anon và authenticated)
CREATE POLICY "Users Read Access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Study Progress Full Access" ON study_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Quiz Attempts Full Access" ON quiz_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Attempt Answers Full Access" ON attempt_answers FOR ALL USING (true) WITH CHECK (true);
