-- ==============================================================================
-- SEED DATA: TIẾNG ANH 8 GLOBAL SUCCESS (HỌC KÌ 1: UNIT 1 - UNIT 6 + 6 ĐỀ KIỂM TRA)
-- Chạy sau khi đã chạy schema.sql
-- ==============================================================================

-- 1. GRADES
INSERT INTO grades (id, name, level) VALUES
('grade-8', 'Lớp 8', 8)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. SUBJECTS
INSERT INTO subjects (id, name, code, icon) VALUES
('english', 'Tiếng Anh', 'ENG', '🇬🇧'),
('math', 'Toán', 'MATH', '📐'),
('science', 'Khoa học tự nhiên', 'SCI', '🧪'),
('literature', 'Ngữ văn', 'LIT', '📖')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- 3. TEXTBOOK SERIES
INSERT INTO textbook_series (id, name, publisher) VALUES
('global-success', 'Global Success (Kết nối tri thức)', 'NXB Giáo Dục Việt Nam'),
('canh-dieu', 'Cánh Diều', 'NXB Đại Học Sư Phạm'),
('chan-troi-sang-tao', 'Chân Trời Sáng Tạo', 'NXB Giáo Dục Việt Nam')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. COURSES
INSERT INTO courses (id, grade_id, subject_id, series_id, title, description) VALUES
('course-eng-8-gs', 'grade-8', 'english', 'global-success', 'Tiếng Anh 8 - Global Success', 'Chương trình ôn tập & luyện thi Tiếng Anh 8 GDPT mới')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 5. DEFAULT STUDENT PROFILE
INSERT INTO users (id, username, full_name, role, pin_code, streak_days) VALUES
('a0000000-0000-0000-0000-000000000001', 'em_lop8', 'Học Sinh Lớp 8', 'student', '1234', 1)
ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 6. UNITS & LESSONS
INSERT INTO units (id, course_id, unit_number, semester, title, vi_title, summary, icon, color) VALUES
('unit-1', 'course-eng-8-gs', 1, 1, 'Leisure Time', 'Thời gian rảnh rỗi', 'Từ vựng về các hoạt động giải trí, sở thích; Ngữ âm /ʊ/ và /uː/; Động từ chỉ sự yêu thích (Verbs of liking/disliking + V-ing / to V).', '🎨', '#4F46E5')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, vi_title = EXCLUDED.vi_title, summary = EXCLUDED.summary;

INSERT INTO lessons (id, unit_id, title, lesson_type, order_index) VALUES
('unit-1-lesson-vocab', 'unit-1', 'Từ vựng & Ngữ âm Leisure Time', 'vocabulary', 1),
('unit-1-lesson-grammar', 'unit-1', 'Ngữ pháp trọng tâm Leisure Time', 'grammar', 2),
('unit-1-lesson-quiz', 'unit-1', 'Bài tập củng cố Leisure Time', 'practice', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- VOCABULARY FOR UNIT-1
INSERT INTO vocabulary (id, unit_id, lesson_id, word, ipa, word_type, meaning, example, example_vi, tip, order_index) VALUES
('u1-v1', 'unit-1', 'unit-1-lesson-vocab', 'leisure', '/ˈleʒə(r)/', 'n', 'thời gian rảnh rỗi, sự giải trí', 'What do you often do in your leisure time?', 'Bạn thường làm gì vào thời gian rảnh rỗi?', 'Cụm từ cố định: in one''s leisure time = in one''s free time', 1),
('u1-v2', 'unit-1', 'unit-1-lesson-vocab', 'do DIY', '/duː ˌdiː aɪ ˈwaɪ/', 'v.phr', 'tự tay làm đồ dùng (Do It Yourself)', 'My brother loves doing DIY to decorate his room.', 'Anh trai tôi thích tự làm đồ thủ công để trang trí phòng.', 'Luôn đi với động từ DO: do DIY', 2),
('u1-v3', 'unit-1', 'unit-1-lesson-vocab', 'make origami', '/meɪk ˌɒrɪˈɡɑːmi/', 'v.phr', 'gấp giấy nghệ thuật Nhật Bản', 'Making origami helps me relax after school.', 'Gấp giấy origami giúp tôi thư giãn sau giờ học.', 'Đi với động từ MAKE: make origami / make crafts', 3),
('u1-v4', 'unit-1', 'unit-1-lesson-vocab', 'knit', '/nɪt/', 'v', 'đan len', 'She is knitting a wool sweater for her grandmother.', 'Cô ấy đang đan một chiếc áo len cho bà.', 'Âm ''k'' ở đầu là âm câm (không đọc âm k) -> /nɪt/, knitting kit: bộ dụng cụ đan len', 4),
('u1-v5', 'unit-1', 'unit-1-lesson-vocab', 'do puzzles', '/duː ˈpʌzlz/', 'v.phr', 'giải câu đố, chơi ghép hình', 'Doing puzzles is great for your brain.', 'Giải câu đố rất tốt cho trí não của bạn.', 'Đi với động từ DO: do puzzles', 5),
('u1-v6', 'unit-1', 'unit-1-lesson-vocab', 'surf the net', '/sɜːf ðə net/', 'v.phr', 'lướt mạng Internet', 'Teenagers shouldn''t spend too much time surfing the net.', 'Thanh thiếu niên không nên dành quá nhiều thời gian lướt mạng.', '= browse the internet / go online', 6),
('u1-v7', 'unit-1', 'unit-1-lesson-vocab', 'message friends', '/ˈmesɪdʒ frendz/', 'v.phr', 'nhắn tin cho bạn bè', 'I prefer messaging friends to calling them.', 'Tôi thích nhắn tin cho bạn bè hơn là gọi điện.', 'Message vừa là danh từ (tin nhắn) vừa là động từ (nhắn tin)', 7),
('u1-v8', 'unit-1', 'unit-1-lesson-vocab', 'hang out (with)', '/hæŋ aʊt/', 'phr.v', 'đi chơi (với bạn bè)', 'We usually hang out at the shopping mall on Sundays.', 'Chúng tôi thường đi chơi ở trung tâm thương mại vào Chủ nhật.', 'hang out + with somebody', 8),
('u1-v9', 'unit-1', 'unit-1-lesson-vocab', 'be keen on', '/bi kiːn ɒn/', 'adj.phr', 'say mê, rất thích', 'Trang is very keen on playing badminton.', 'Trang rất mê chơi cầu lông.', 'be keen on + V-ing / Noun = be fond of = be interested in', 9),
('u1-v10', 'unit-1', 'unit-1-lesson-vocab', 'be fond of', '/bi fɒnd əv/', 'adj.phr', 'thích, yêu mến', 'My grandfather is fond of gardening.', 'Ông tôi rất thích làm vườn.', 'Theo sau giới từ (on, of, in, about) LUÔN là V-ing', 10),
('u1-v11', 'unit-1', 'unit-1-lesson-vocab', 'be crazy about', '/bi ˈkreɪzi əˈbaʊt/', 'adj.phr', 'phát cuồng vì, cực kỳ mê', 'Tom is crazy about playing computer games.', 'Tom cực kỳ mê chơi trò chơi máy tính.', 'Mức độ thích rất mạnh, tương đương ''adore''', 11),
('u1-v12', 'unit-1', 'unit-1-lesson-vocab', 'fancy', '/ˈfænsi/', 'v', 'thích, muốn', 'Do you fancy going to the cinema this evening?', 'Tối nay bạn có muốn đi xem phim không?', 'Bẫy thi: Fancy + V-ing (KHÔNG đi với to V)', 12),
('u1-v13', 'unit-1', 'unit-1-lesson-vocab', 'detest', '/dɪˈtest/', 'v', 'căm ghét, cực kỳ ghét', 'I detest waking up early on cold winter days.', 'Tôi cực kỳ ghét phải dậy sớm vào những ngày đông lạnh giá.', 'Trọng âm rơi vào âm tiết thứ 2 (/dɪˈtest/). Detest + V-ing', 13),
('u1-v14', 'unit-1', 'unit-1-lesson-vocab', 'adore', '/əˈdɔː(r)/', 'v', 'yêu thích, mê mẩn', 'Little girls often adore playing with dolls.', 'Các bé gái thường mê chơi búp bê.', 'Trọng âm âm 2 (/əˈdɔː/). Adore + V-ing', 14),
('u1-v15', 'unit-1', 'unit-1-lesson-vocab', 'keep in touch', '/kiːp ɪn tʌtʃ/', 'v.phr', 'giữ liên lạc', 'Social media helps us keep in touch with distant friends.', 'Mạng xã hội giúp chúng ta giữ liên lạc với bạn bè ở xa.', 'keep in touch WITH somebody', 15)
ON CONFLICT (id) DO UPDATE SET meaning = EXCLUDED.meaning, example = EXCLUDED.example, tip = EXCLUDED.tip;

-- GRAMMAR FOR UNIT-1
INSERT INTO grammar_topics (id, unit_id, lesson_id, topic_title, formula, explanation, exam_traps, order_index) VALUES
('u1-g1', 'unit-1', 'unit-1-lesson-grammar', '1. Động từ chỉ sự yêu thích / ghét (Verbs of liking and disliking)', NULL, 'Nhóm 1: Đi được với cả V-ing VÀ to-V (nghĩa hầu như không đổi): like, love, hate, prefer.
Ví dụ: She likes knitting. = She likes to knit.
Nhóm 2: CHỈ đi với danh động từ (V-ing), TUYỆT ĐỐI KHÔNG đi với to-V: adore (rất thích), fancy (thích), enjoy (thích), mind (ngại/phiền), detest (căm ghét), dislike (không thích).
Ví dụ: I fancy making origami. (ĐÚNG) — I fancy to make origami. (SAI)', 'Cấu trúc ''would like / would love / would prefer'' luôn đi với TO + V nguyên thể (Ví dụ: I''d like to go out).
Cấu trúc ''prefer + V-ing + TO + V-ing'' (thích làm gì hơn làm gì): I prefer reading books to watching TV.
Các cụm tính từ: be keen on / be fond of / be interested in / be crazy about / be into + V-ing.', 1)
ON CONFLICT (id) DO UPDATE SET topic_title = EXCLUDED.topic_title, explanation = EXCLUDED.explanation, formula = EXCLUDED.formula, exam_traps = EXCLUDED.exam_traps;

-- EXERCISE (PRACTICE QUIZ) FOR UNIT-1
INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('quiz-unit-1', 'course-eng-8-gs', 'unit-1', 'unit-1-lesson-quiz', 'Bài tập củng cố Leisure Time', 'unit_quiz', 'Luyện tập', 15, 'Kiến thức Leisure Time', '12 câu trắc nghiệm kiểm tra từ vựng, ngữ pháp và phát âm')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q1', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Choose the word whose underlined part is pronounced differently: A. c<u>oo</u>k   B. b<u>oo</u>k   C. sch<u>oo</u>l   D. f<u>oo</u>t', '''school'' phát âm là /skuːl/ (âm /uː/ dài). Các từ còn lại (cook, book, foot) phát âm là /ʊ/ ngắn.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q1_opt_0', 'u1-q1', 0, 'A. cook', FALSE),
('u1-q1_opt_1', 'u1-q1', 1, 'B. book', FALSE),
('u1-q1_opt_2', 'u1-q1', 2, 'C. school', TRUE),
('u1-q1_opt_3', 'u1-q1', 3, 'D. foot', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q2', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Choose the word whose underlined part is pronounced differently: A. gr<u>ou</u>p   B. s<u>ou</u>p   C. w<u>ou</u>ld   D. t<u>oo</u>th', '''would'' phát âm là /wʊd/ (âm /ʊ/ ngắn). Các từ group, soup, tooth đều phát âm là /uː/ dài.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q2_opt_0', 'u1-q2', 0, 'A. group', FALSE),
('u1-q2_opt_1', 'u1-q2', 1, 'B. soup', FALSE),
('u1-q2_opt_2', 'u1-q2', 2, 'C. would', TRUE),
('u1-q2_opt_3', 'u1-q2', 3, 'D. tooth', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q3', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Do you fancy _______ out with friends at the shopping mall this Sunday?', 'Sau động từ ''fancy'' (thích/muốn) bắt buộc dùng V-ing -> hanging.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q3_opt_0', 'u1-q3', 0, 'A. hang', FALSE),
('u1-q3_opt_1', 'u1-q3', 1, 'B. hanging', TRUE),
('u1-q3_opt_2', 'u1-q3', 2, 'C. to hang', FALSE),
('u1-q3_opt_3', 'u1-q3', 3, 'D. hung', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q4', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'My younger sister detests _______ housework at weekends.', 'Sau ''detest'' (cực kỳ ghét) chỉ dùng V-ing -> doing.', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q4_opt_0', 'u1-q4', 0, 'A. doing', TRUE),
('u1-q4_opt_1', 'u1-q4', 1, 'B. to do', FALSE),
('u1-q4_opt_2', 'u1-q4', 2, 'C. do', FALSE),
('u1-q4_opt_3', 'u1-q4', 3, 'D. does', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q5', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'My dad loves _______ DIY. He made this wooden bookshelf himself.', 'Cụm từ cố định: ''do DIY'' (tự tay làm/sửa chữa đồ đạc).', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q5_opt_0', 'u1-q5', 0, 'A. making', FALSE),
('u1-q5_opt_1', 'u1-q5', 1, 'B. doing', TRUE),
('u1-q5_opt_2', 'u1-q5', 2, 'C. playing', FALSE),
('u1-q5_opt_3', 'u1-q5', 3, 'D. going', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q6', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Nam is very _______ on playing badminton. He plays it every afternoon.', 'Ta có cụm: ''be keen on + V-ing'' (say mê, thích làm gì). Fond đi với ''of'', crazy đi với ''about'', interested đi với ''in''.', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q6_opt_0', 'u1-q6', 0, 'A. fond', FALSE),
('u1-q6_opt_1', 'u1-q6', 1, 'B. crazy', FALSE),
('u1-q6_opt_2', 'u1-q6', 2, 'C. interested', FALSE),
('u1-q6_opt_3', 'u1-q6', 3, 'D. keen', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q7', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'I would like _______ you to my birthday party this Saturday evening.', 'Khác với ''like + V-ing/to V'', cấu trúc ''would like'' LUÔN đi với ''to + V nguyên thể'' -> to invite.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q7_opt_0', 'u1-q7', 0, 'A. invite', FALSE),
('u1-q7_opt_1', 'u1-q7', 1, 'B. inviting', FALSE),
('u1-q7_opt_2', 'u1-q7', 2, 'C. to invite', TRUE),
('u1-q7_opt_3', 'u1-q7', 3, 'D. invited', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q8', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Many teenagers prefer messaging their friends _______ calling them directly.', 'Cấu trúc thích cái gì hơn cái gì: ''prefer + V-ing + TO + V-ing''.', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q8_opt_0', 'u1-q8', 0, 'A. than', FALSE),
('u1-q8_opt_1', 'u1-q8', 1, 'B. to', TRUE),
('u1-q8_opt_2', 'u1-q8', 2, 'C. more than', FALSE),
('u1-q8_opt_3', 'u1-q8', 3, 'D. from', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q9', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Making _______ requires only a piece of paper and your skilful hands.', '''make origami'' là nghệ thuật gấp giấy Nhật Bản (chỉ cần giấy và đôi tay khéo léo).', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q9_opt_0', 'u1-q9', 0, 'A. origami', TRUE),
('u1-q9_opt_1', 'u1-q9', 1, 'B. knitting', FALSE),
('u1-q9_opt_2', 'u1-q9', 2, 'C. puzzles', FALSE),
('u1-q9_opt_3', 'u1-q9', 3, 'D. judo', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q10', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Would you mind _______ the window? It is quite cold in here.', 'Cấu trúc ''Would you mind + V-ing?'' (Bạn có phiền làm gì đó không?) -> closing.', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q10_opt_0', 'u1-q10', 0, 'A. close', FALSE),
('u1-q10_opt_1', 'u1-q10', 1, 'B. to close', FALSE),
('u1-q10_opt_2', 'u1-q10', 2, 'C. closing', TRUE),
('u1-q10_opt_3', 'u1-q10', 3, 'D. closed', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q11', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Social media helps me _______ in touch with my old friends from primary school.', 'Cụm từ ''keep in touch with sb'': giữ liên lạc với ai.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q11_opt_0', 'u1-q11', 0, 'A. make', FALSE),
('u1-q11_opt_1', 'u1-q11', 1, 'B. keep', TRUE),
('u1-q11_opt_2', 'u1-q11', 2, 'C. do', FALSE),
('u1-q11_opt_3', 'u1-q11', 3, 'D. take', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u1-q12', 'quiz-unit-1', 'Trắc nghiệm củng cố', 'Find the mistake: My brother is <u>crazy</u> <u>about</u> <u>to play</u> chess <u>in</u> his free time.', 'Sau giới từ ''about'' (trong cụm ''be crazy about'') phải dùng V-ing -> sửa ''to play'' thành ''playing''.', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u1-q12_opt_0', 'u1-q12', 0, 'A. crazy', FALSE),
('u1-q12_opt_1', 'u1-q12', 1, 'B. about', FALSE),
('u1-q12_opt_2', 'u1-q12', 2, 'C. to play', TRUE),
('u1-q12_opt_3', 'u1-q12', 3, 'D. in', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO units (id, course_id, unit_number, semester, title, vi_title, summary, icon, color) VALUES
('unit-2', 'course-eng-8-gs', 2, 1, 'Life in the Countryside', 'Cuộc sống ở miền quê', 'Từ vựng về hoạt động nhà nông, cảnh sắc làng quê; Ngữ âm /ə/ và /ɪ/; So sánh hơn của trạng từ (Comparative adverbs).', '🌾', '#059669')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, vi_title = EXCLUDED.vi_title, summary = EXCLUDED.summary;

INSERT INTO lessons (id, unit_id, title, lesson_type, order_index) VALUES
('unit-2-lesson-vocab', 'unit-2', 'Từ vựng & Ngữ âm Life in the Countryside', 'vocabulary', 1),
('unit-2-lesson-grammar', 'unit-2', 'Ngữ pháp trọng tâm Life in the Countryside', 'grammar', 2),
('unit-2-lesson-quiz', 'unit-2', 'Bài tập củng cố Life in the Countryside', 'practice', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- VOCABULARY FOR UNIT-2
INSERT INTO vocabulary (id, unit_id, lesson_id, word, ipa, word_type, meaning, example, example_vi, tip, order_index) VALUES
('u2-v1', 'unit-2', 'unit-2-lesson-vocab', 'harvest', '/ˈhɑːvɪst/', 'n, v', 'vụ mùa, thu hoạch, gặt hái', 'Farmers are extremely busy during harvest time.', 'Nông dân cực kỳ bận rộn vào mùa gặt.', 'harvest time = mùa gặt', 1),
('u2-v2', 'unit-2', 'unit-2-lesson-vocab', 'combine harvester', '/ˈkɒmbaɪn ˈhɑːvɪstə(r)/', 'n.phr', 'máy gặt đập liên hợp', 'They use a combine harvester to cut and thresh rice quickly.', 'Họ dùng máy gặt đập liên hợp để cắt và tuốt lúa nhanh chóng.', 'Máy móc hiện đại nhất xuất hiện trong bài đọc Unit 2', 2),
('u2-v3', 'unit-2', 'unit-2-lesson-vocab', 'load / unload', '/ləʊd/ - /ˌʌnˈləʊd/', 'v', 'chất hàng lên / dỡ hàng xuống', 'The villagers are unloading the rice from the truck.', 'Dân làng đang dỡ lúa từ trên xe tải xuống.', 'load sth onto... (chất lên) >< unload sth from... (dỡ xuống)', 3),
('u2-v4', 'unit-2', 'unit-2-lesson-vocab', 'herd', '/hɜːd/', 'v', 'chăn, lùa (gia súc)', 'Country children often help their parents herd the buffaloes.', 'Trẻ em vùng quê thường giúp bố mẹ chăn trâu.', 'herd buffaloes / cattle / sheep', 4),
('u2-v5', 'unit-2', 'unit-2-lesson-vocab', 'plough', '/plaʊ/', 'v, n', 'cày (ruộng), cái cày', 'In the past, farmers used buffaloes to plough their fields.', 'Ngày xưa, nông dân dùng trâu để cày ruộng.', 'plough a field = cày ruộng', 5),
('u2-v6', 'unit-2', 'unit-2-lesson-vocab', 'milk cows', '/mɪlk kaʊz/', 'v.phr', 'vắt sữa bò', 'Workers on the dairy farm milk cows twice a day.', 'Công nhân ở trang trại bò sữa vắt sữa bò hai lần một ngày.', 'Milk ở đây là động từ (vắt sữa)', 6),
('u2-v7', 'unit-2', 'unit-2-lesson-vocab', 'dry the rice', '/draɪ ðə raɪs/', 'v.phr', 'phơi thóc / lúa', 'My grandmother is drying the rice in the front yard.', 'Bà tôi đang phơi thóc ở sân trước.', 'Dry (v): làm khô, phơi khô', 7),
('u2-v8', 'unit-2', 'unit-2-lesson-vocab', 'paddy field', '/ˈpædi fiːld/', 'n.phr', 'cánh đồng lúa', 'Green paddy fields stretch as far as the eye can see.', 'Những cánh đồng lúa xanh mướt trải dài tít tắp.', '= rice field', 8),
('u2-v9', 'unit-2', 'unit-2-lesson-vocab', 'orchard', '/ˈɔːtʃəd/', 'n', 'vườn cây ăn quả', 'We spent the morning picking fruit in the orchard.', 'Chúng tôi dành buổi sáng hái trái cây trong vườn cây ăn quả.', 'Vườn hoa/rau là garden, vườn cây ăn quả là orchard', 9),
('u2-v10', 'unit-2', 'unit-2-lesson-vocab', 'hospitable', '/hɒˈspɪtəbl/', 'adj', 'hiếu khách, mến khách', 'People in my hometown are very friendly and hospitable.', 'Người dân quê tôi rất thân thiện và hiếu khách.', 'Dạng trạng từ: hospitably (so sánh hơn: more hospitably)', 10),
('u2-v11', 'unit-2', 'unit-2-lesson-vocab', 'picturesque', '/ˌpɪktʃəˈresk/', 'adj', 'đẹp như tranh vẽ', 'The ancient village is located in a picturesque valley.', 'Ngôi làng cổ nằm trong một thung lũng đẹp như tranh vẽ.', 'Trọng âm rơi vào âm tiết cuối /-ˈresk/', 11),
('u2-v12', 'unit-2', 'unit-2-lesson-vocab', 'vast', '/vɑːst/', 'adj', 'rộng lớn, mênh mông, bát ngát', 'Nomads move across the vast grasslands.', 'Người du mục di chuyển qua những đồng cỏ mênh mông.', 'vast open spaces: không gian rộng mở mênh mông', 12),
('u2-v13', 'unit-2', 'unit-2-lesson-vocab', 'well-trained', '/ˌwel ˈtreɪnd/', 'adj', 'được đào tạo bài bản, lành nghề', 'The farm employs well-trained workers to operate machines.', 'Trang trại thuê những công nhân lành nghề để vận hành máy móc.', 'Tính từ ghép', 13),
('u2-v14', 'unit-2', 'unit-2-lesson-vocab', 'cultivate', '/ˈkʌltɪveɪt/', 'v', 'canh tác, trồng trọt', 'Local people mainly cultivate wet rice and corn.', 'Người dân địa phương chủ yếu canh tác lúa nước và ngô.', 'Trọng âm âm 1: /ˈkʌltɪveɪt/', 14),
('u2-v15', 'unit-2', 'unit-2-lesson-vocab', 'poultry / cattle', '/ˈpəʊltri/ - /ˈkætl/', 'n', 'gia cầm (gà, vịt) / gia súc lớn (bò, trâu)', 'His family raises both poultry and cattle on the farm.', 'Gia đình ông ấy nuôi cả gia cầm và gia súc trong trang trại.', 'Cattle luôn mang nghĩa số nhiều (Cattle ARE grazing)', 15)
ON CONFLICT (id) DO UPDATE SET meaning = EXCLUDED.meaning, example = EXCLUDED.example, tip = EXCLUDED.tip;

-- GRAMMAR FOR UNIT-2
INSERT INTO grammar_topics (id, unit_id, lesson_id, topic_title, formula, explanation, exam_traps, order_index) VALUES
('u2-g1', 'unit-2', 'unit-2-lesson-grammar', '1. So sánh hơn của Trạng từ (Comparative forms of Adverbs)', NULL, 'a) Trạng từ ngắn (1 âm tiết, viết giống tính từ): fast, hard, early, late, high, near, long, soon -> Thêm đuôi ''-er'' + than.
Ví dụ: Farmers in my village work harder than people in the city. / She woke up earlier than usual.
b) Trạng từ dài (2 âm tiết trở lên, thường có đuôi ''-ly''): slowly, carefully, peacefully, soundly, generously, traditionally -> Dùng ''more / less + trạng từ + than''.
Ví dụ: With a combine harvester, farmers can harvest rice more quickly than before.
c) Trạng từ bất quy tắc (BẮT BUỘC HỌC THUỘC): well -> better; badly -> worse; far -> farther / further; little -> less; much/many -> more.', 'Phân biệt khi nào dùng Tính từ, khi nào dùng Trạng từ trong câu so sánh: Nếu trước chỗ trống là động từ TO BE (am/is/are/was/were) hoặc linking verbs (seem, look, feel, become) -> dùng TÍNH TỪ (happier, more peaceful). Nếu trước chỗ trống là ĐỘNG TỪ THƯỜNG (run, work, drive, sleep, live) -> dùng TRẠNG TỪ (faster, harder, more peacefully).
Lưu ý: ''hard'' vừa là tính từ vừa là trạng từ (so sánh hơn là ''harder''). Còn ''hardly'' có nghĩa là ''hầu như không'', KHÔNG phải trạng từ của hard!
Lưu ý: ''early'' kết thúc bằng -y nhưng là trạng từ ngắn -> đổi thành ''earlier'' (không dùng more early).', 1)
ON CONFLICT (id) DO UPDATE SET topic_title = EXCLUDED.topic_title, explanation = EXCLUDED.explanation, formula = EXCLUDED.formula, exam_traps = EXCLUDED.exam_traps;

-- EXERCISE (PRACTICE QUIZ) FOR UNIT-2
INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('quiz-unit-2', 'course-eng-8-gs', 'unit-2', 'unit-2-lesson-quiz', 'Bài tập củng cố Life in the Countryside', 'unit_quiz', 'Luyện tập', 15, 'Kiến thức Life in the Countryside', '12 câu trắc nghiệm kiểm tra từ vựng, ngữ pháp và phát âm')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q1', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'Choose the word whose underlined part is pronounced differently: A. v<u>i</u>llage   B. h<u>a</u>rvest   C. p<u>i</u>ck   D. b<u>u</u>ild', 'Phần gạch chân chữ ''a'' trong ''harvest'' phát âm là /ɑː/, còn phần gạch chân trong village, pick, build đều phát âm là /ɪ/.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q1_opt_0', 'u2-q1', 0, 'A. village', FALSE),
('u2-q1_opt_1', 'u2-q1', 1, 'B. harvest', TRUE),
('u2-q1_opt_2', 'u2-q1', 2, 'C. pick', FALSE),
('u2-q1_opt_3', 'u2-q1', 3, 'D. build', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q2', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'Thanks to the combine harvester, farmers can harvest their crops _______ than in the past.', 'Bổ nghĩa cho động từ thường ''harvest'' cần dùng trạng từ ''quickly''. Trạng từ đuôi -ly khi so sánh hơn dùng ''more quickly''.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q2_opt_0', 'u2-q2', 0, 'A. quicklier', FALSE),
('u2-q2_opt_1', 'u2-q2', 1, 'B. more quick', FALSE),
('u2-q2_opt_2', 'u2-q2', 2, 'C. more quickly', TRUE),
('u2-q2_opt_3', 'u2-q2', 3, 'D. quicker', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q3', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'During harvest time, farmers have to get up _______ than on normal days.', '''early'' là trạng từ đặc biệt có dạng so sánh hơn là ''earlier'' (y đổi thành i + er).', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q3_opt_0', 'u2-q3', 0, 'A. more early', FALSE),
('u2-q3_opt_1', 'u2-q3', 1, 'B. earlier', TRUE),
('u2-q3_opt_2', 'u2-q3', 2, 'C. earlyer', FALSE),
('u2-q3_opt_3', 'u2-q3', 3, 'D. earliest', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q4', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'After a hard working day in the field, the workers slept _______ than ever.', 'Bổ nghĩa cho động từ ''slept'' (ngủ) -> dùng cụm ''sleep soundly'' (ngủ say). So sánh hơn là ''more soundly''.', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q4_opt_0', 'u2-q4', 0, 'A. soundlier', FALSE),
('u2-q4_opt_1', 'u2-q4', 1, 'B. more sound', FALSE),
('u2-q4_opt_2', 'u2-q4', 2, 'C. more soundly', TRUE),
('u2-q4_opt_3', 'u2-q4', 3, 'D. sounder', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q5', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'People in the countryside are famous for being friendly and _______ to visitors.', '''hospitable'' nghĩa là hiếu khách, mến khách (rất hợp ngữ cảnh với visitors).', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q5_opt_0', 'u2-q5', 0, 'A. hospitable', TRUE),
('u2-q5_opt_1', 'u2-q5', 1, 'B. vast', FALSE),
('u2-q5_opt_2', 'u2-q5', 2, 'C. picturesque', FALSE),
('u2-q5_opt_3', 'u2-q5', 3, 'D. well-trained', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q6', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'The strong men are helping _______ the rice bags from the truck into the warehouse.', '''unload ... from the truck'': dỡ hàng từ trên xe tải xuống.', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q6_opt_0', 'u2-q6', 0, 'A. herd', FALSE),
('u2-q6_opt_1', 'u2-q6', 1, 'B. plough', FALSE),
('u2-q6_opt_2', 'u2-q6', 2, 'C. milk', FALSE),
('u2-q6_opt_3', 'u2-q6', 3, 'D. unload', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q7', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'My sister dances _______ than I do, so she was chosen for the school show.', 'Trạng từ của ''good'' là ''well'' (dances well). Dạng so sánh hơn bất quy tắc của ''well'' là ''better''.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q7_opt_0', 'u2-q7', 0, 'A. more good', FALSE),
('u2-q7_opt_1', 'u2-q7', 1, 'B. weller', FALSE),
('u2-q7_opt_2', 'u2-q7', 2, 'C. better', TRUE),
('u2-q7_opt_3', 'u2-q7', 3, 'D. more well', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q8', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'We visited a vast fruit _______ in Tien Giang and tasted fresh mangoes.', '''orchard'' là vườn cây ăn quả (hợp với fruit và fresh mangoes).', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q8_opt_0', 'u2-q8', 0, 'A. paddy field', FALSE),
('u2-q8_opt_1', 'u2-q8', 1, 'B. orchard', TRUE),
('u2-q8_opt_2', 'u2-q8', 2, 'C. canal', FALSE),
('u2-q8_opt_3', 'u2-q8', 3, 'D. pond', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q9', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'In the countryside, life seems _______ and people live _______ than in big cities.', 'Sau linking verb ''seems'' dùng tính từ (more peaceful); sau động từ thường ''live'' dùng trạng từ (more happily).', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q9_opt_0', 'u2-q9', 0, 'A. more peaceful / more happily', TRUE),
('u2-q9_opt_1', 'u2-q9', 1, 'B. more peacefully / more happy', FALSE),
('u2-q9_opt_2', 'u2-q9', 2, 'C. peacefuler / happier', FALSE),
('u2-q9_opt_3', 'u2-q9', 3, 'D. more peaceful / happier', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q10', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'Look! A boy is _______ a herd of buffaloes along the green pasture.', '''herd buffaloes'' = chăn trâu.', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q10_opt_0', 'u2-q10', 0, 'A. ploughing', FALSE),
('u2-q10_opt_1', 'u2-q10', 1, 'B. herding', TRUE),
('u2-q10_opt_2', 'u2-q10', 2, 'C. drying', FALSE),
('u2-q10_opt_3', 'u2-q10', 3, 'D. harvesting', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q11', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'It rained _______ today than yesterday, so the village roads were flooded.', 'Bổ nghĩa cho động từ ''rained'' -> dùng trạng từ ''heavily'' -> so sánh hơn ''more heavily''.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q11_opt_0', 'u2-q11', 0, 'A. more heavily', TRUE),
('u2-q11_opt_1', 'u2-q11', 1, 'B. heavilier', FALSE),
('u2-q11_opt_2', 'u2-q11', 2, 'C. more heavy', FALSE),
('u2-q11_opt_3', 'u2-q11', 3, 'D. heavier', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u2-q12', 'quiz-unit-2', 'Trắc nghiệm củng cố', 'Rewrite check: ''Lan speaks English more fluently than Mai.'' means _______.', 'Lan nói tiếng Anh trôi chảy hơn Mai = Mai không nói tiếng Anh trôi chảy bằng Lan (not as + adv + as).', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u2-q12_opt_0', 'u2-q12', 0, 'A. Mai speaks English more fluently than Lan.', FALSE),
('u2-q12_opt_1', 'u2-q12', 1, 'B. Mai doesn''t speak English as fluently as Lan.', TRUE),
('u2-q12_opt_2', 'u2-q12', 2, 'C. Mai speaks English fluentlier than Lan.', FALSE),
('u2-q12_opt_3', 'u2-q12', 3, 'D. Lan speaks English less fluently than Mai.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO units (id, course_id, unit_number, semester, title, vi_title, summary, icon, color) VALUES
('unit-3', 'course-eng-8-gs', 3, 1, 'Teenagers', 'Thanh thiếu niên', 'Từ vựng về câu lạc bộ học đường, mạng xã hội và áp lực tuổi teen; Ngữ âm /ʊə/ và /ɔɪ/; Câu đơn (Simple sentences) và Câu ghép (Compound sentences).', '🎒', '#D97706')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, vi_title = EXCLUDED.vi_title, summary = EXCLUDED.summary;

INSERT INTO lessons (id, unit_id, title, lesson_type, order_index) VALUES
('unit-3-lesson-vocab', 'unit-3', 'Từ vựng & Ngữ âm Teenagers', 'vocabulary', 1),
('unit-3-lesson-grammar', 'unit-3', 'Ngữ pháp trọng tâm Teenagers', 'grammar', 2),
('unit-3-lesson-quiz', 'unit-3', 'Bài tập củng cố Teenagers', 'practice', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- VOCABULARY FOR UNIT-3
INSERT INTO vocabulary (id, unit_id, lesson_id, word, ipa, word_type, meaning, example, example_vi, tip, order_index) VALUES
('u3-v1', 'unit-3', 'unit-3-lesson-vocab', 'peer pressure', '/ˈpɪə preʃə(r)/', 'n.phr', 'áp lực đồng trang lứa (từ bạn bè)', 'Many teenagers suffer from peer pressure at school.', 'Nhiều thanh thiếu niên chịu áp lực đồng trang lứa ở trường.', 'peer (n): bạn đồng trang lứa; pressure (n): áp lực', 1),
('u3-v2', 'unit-3', 'unit-3-lesson-vocab', 'expectation', '/ˌekspekˈteɪʃn/', 'n', 'sự kỳ vọng, mong đợi', 'High parental expectations can make teens feel stressed.', 'Sự kỳ vọng cao của cha mẹ có thể khiến tuổi teen cảm thấy căng thẳng.', 'meet one''s expectations: đáp ứng kỳ vọng của ai', 2),
('u3-v3', 'unit-3', 'unit-3-lesson-vocab', 'bully', '/ˈbʊli/', 'v, n', 'bắt nạt / kẻ bắt nạt', 'Schools must take action to stop cyberbullying.', 'Nhà trường phải hành động để ngăn chặn bắt nạt trên mạng.', 'school bullying (bắt nạt học đường), cyberbullying (bắt nạt qua mạng)', 3),
('u3-v4', 'unit-3', 'unit-3-lesson-vocab', 'concentrate (on)', '/ˈkɒnsntreɪt/', 'v', 'tập trung (vào)', 'Turn off notifications so you can concentrate on your study.', 'Hãy tắt thông báo để bạn có thể tập trung vào việc học.', 'concentrate ON sth = focus ON sth', 4),
('u3-v5', 'unit-3', 'unit-3-lesson-vocab', 'forum', '/ˈfɔːrəm/', 'n', 'diễn đàn', 'Students often discuss homework on the school forum.', 'Học sinh thường thảo luận bài tập về nhà trên diễn đàn trường.', 'post a question on the forum', 5),
('u3-v6', 'unit-3', 'unit-3-lesson-vocab', 'browse', '/braʊz/', 'v', 'duyệt, lướt xem (trang web)', 'She spent half an hour browsing the school website.', 'Cô ấy dành nửa tiếng để lướt xem trang web của trường.', 'browse a website', 6),
('u3-v7', 'unit-3', 'unit-3-lesson-vocab', 'upload / download', '/ˌʌpˈləʊd/ - /ˌdaʊnˈləʊd/', 'v', 'tải lên / tải xuống', 'He uploaded photos of the sports competition to Facebook.', 'Cậu ấy đã tải ảnh cuộc thi thể thao lên Facebook.', 'upload TO somewhere / download FROM somewhere', 7),
('u3-v8', 'unit-3', 'unit-3-lesson-vocab', 'notification', '/ˌnəʊtɪfɪˈkeɪʃn/', 'n', 'thông báo (trên điện thoại/mạng)', 'I check my notifications as soon as I wake up.', 'Tôi kiểm tra thông báo ngay khi thức dậy.', 'Trọng âm rơi vào âm tiết trước đuôi -tion: /-ˈkeɪʃn/', 8),
('u3-v9', 'unit-3', 'unit-3-lesson-vocab', 'log on (to)', '/lɒɡ ɒn/', 'phr.v', 'đăng nhập (vào tài khoản)', 'You need a password to log on to your account.', 'Bạn cần mật khẩu để đăng nhập vào tài khoản.', '= log in (to)', 9),
('u3-v10', 'unit-3', 'unit-3-lesson-vocab', 'user-friendly', '/ˌjuːzə ˈfrendli/', 'adj', 'thân thiện với người dùng, dễ sử dụng', 'This learning app is very user-friendly for 8th graders.', 'Ứng dụng học tập này rất dễ sử dụng cho học sinh lớp 8.', 'Trái nghĩa với complicated / hard to use', 10),
('u3-v11', 'unit-3', 'unit-3-lesson-vocab', 'stressful / stressed', '/ˈstresfl/ - /strest/', 'adj', 'gây căng thẳng (vật/việc) / cảm thấy căng thẳng (người)', 'Preparing for the final exam is stressful, so I feel stressed.', 'Chuẩn bị cho kì thi cuối kì rất căng thẳng, nên tôi cảm thấy áp lực.', 'Vật/việc dùng -ful (stressful), cảm xúc con người dùng -ed (stressed)', 11),
('u3-v12', 'unit-3', 'unit-3-lesson-vocab', 'connect (with)', '/kəˈnekt/', 'v', 'kết nối (với)', 'Clubs help teenagers connect with peers who share the same interests.', 'Các câu lạc bộ giúp thiếu niên kết nối với bạn bè cùng sở thích.', 'connection (n): sự kết nối', 12),
('u3-v13', 'unit-3', 'unit-3-lesson-vocab', 'mature', '/məˈtʃʊə(r)/', 'adj', 'trưởng thành, chín chắn', 'Joining teamwork activities makes teenagers more mature.', 'Tham gia hoạt động nhóm giúp thanh thiếu niên trưởng thành hơn.', 'Chứa âm /ʊə/ của Unit 3!', 13),
('u3-v14', 'unit-3', 'unit-3-lesson-vocab', 'tournament', '/ˈtʊənəmənt/', 'n', 'giải đấu', 'Our chess club is organizing an annual tournament next month.', 'Câu lạc bộ cờ vua của chúng tôi sẽ tổ chức giải đấu thường niên vào tháng tới.', 'Chứa âm /ʊə/ đầu từ', 14)
ON CONFLICT (id) DO UPDATE SET meaning = EXCLUDED.meaning, example = EXCLUDED.example, tip = EXCLUDED.tip;

-- GRAMMAR FOR UNIT-3
INSERT INTO grammar_topics (id, unit_id, lesson_id, topic_title, formula, explanation, exam_traps, order_index) VALUES
('u3-g1', 'unit-3', 'unit-3-lesson-grammar', '1. Câu đơn (Simple Sentences) và Câu ghép (Compound Sentences)', NULL, 'a) Câu đơn (Simple sentence): Chỉ có MỘT mệnh đề độc lập (1 cụm Chủ ngữ - Vị ngữ chính). Ví dụ: Minh likes playing chess.
b) Câu ghép (Compound sentence): Gồm HAI (hoặc nhiều) mệnh đề độc lập ghép lại với nhau. Có 2 cách nối:
CÁCH 1: Dùng Liên từ kết hợp (Coordinating conjunctions - Mẹo nhớ: F-A-N-B-O-Y-S), trước liên từ có dấu phẩy (,):
• for (bởi vì) | • and (và) | • nor (cũng không) | • but (nhưng) | • or (hoặc là, kẻo mà) | • yet (thế nhưng) | • so (vì vậy)
CÁCH 2: Dùng Trạng từ liên kết (Conjunctive adverbs) — ĐẶC BIỆT CHÚ Ý DẤU CÂU (đề thi cực hay hỏi!):
Công thức: Mệnh đề 1 + [ ; ] (hoặc dấu chấm) + Trạng từ liên kết + [ , ] + Mệnh đề 2.
• however (tuy nhiên - chỉ sự đối lập) | • therefore (do đó, vì vậy - chỉ kết quả) | • otherwise (nếu không thì) | • moreover / furthermore (hơn thế nữa - bổ sung ý)', 'MẸO NHÌN DẤU CÂU TRONG BÀI TRẮC NGHIỆM: Nếu chỗ trống có dạng: `, ______ ` (chỉ có 1 dấu phẩy đằng trước) -> Chọn nhóm FANBOYS (and, but, or, so, for).
Nếu chỗ trống có dạng: `; ______ ,` hoặc `. ______ ,` (có dấu chấm phẩy/dấu chấm trước VÀ dấu phẩy sau) -> BẮT BUỘC chọn nhóm Trạng từ liên kết (however, therefore, otherwise, moreover)!
Phân biệt ''or'' và ''otherwise'': Cả 2 đều dịch là ''nếu không thì'', nhưng ''or'' đứng sau dấu phẩy (, or), còn ''otherwise'' đứng giữa (; otherwise,).', 1)
ON CONFLICT (id) DO UPDATE SET topic_title = EXCLUDED.topic_title, explanation = EXCLUDED.explanation, formula = EXCLUDED.formula, exam_traps = EXCLUDED.exam_traps;

-- EXERCISE (PRACTICE QUIZ) FOR UNIT-3
INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('quiz-unit-3', 'course-eng-8-gs', 'unit-3', 'unit-3-lesson-quiz', 'Bài tập củng cố Teenagers', 'unit_quiz', 'Luyện tập', 15, 'Kiến thức Teenagers', '12 câu trắc nghiệm kiểm tra từ vựng, ngữ pháp và phát âm')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q1', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'Choose the word whose underlined part is pronounced differently: A. b<u>oy</u>   B. v<u>oi</u>ce   C. t<u>ou</u>rist   D. ch<u>oi</u>ce', '''tourist'' phát âm là /ˈtʊərɪst/ (âm /ʊə/). Các từ boy, voice, choice đều chứa âm /ɔɪ/.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q1_opt_0', 'u3-q1', 0, 'A. boy', FALSE),
('u3-q1_opt_1', 'u3-q1', 1, 'B. voice', FALSE),
('u3-q1_opt_2', 'u3-q1', 2, 'C. tourist', TRUE),
('u3-q1_opt_3', 'u3-q1', 3, 'D. choice', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q2', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'She wanted to prepare well for the midterm test; _______, she turned off her smartphone.', 'Quan sát dấu câu: phía trước có dấu chấm phẩy (;) và phía sau có dấu phẩy (,) -> phải dùng trạng từ liên kết. Về nghĩa: ''Muốn chuẩn bị tốt cho bài thi; DO ĐÓ (therefore), cô ấy tắt điện thoại''.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q2_opt_0', 'u3-q2', 0, 'A. so', FALSE),
('u3-q2_opt_1', 'u3-q2', 1, 'B. but', FALSE),
('u3-q2_opt_2', 'u3-q2', 2, 'C. therefore', TRUE),
('u3-q2_opt_3', 'u3-q2', 3, 'D. however', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q3', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'You should focus on the lesson in class; _______, you won''t understand the grammar points.', 'Có cấu trúc `; _______ ,` và mang nghĩa ''nếu không thì'' -> chọn ''otherwise''. (Không chọn ''or'' vì sau ''or'' không có dấu phẩy).', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q3_opt_0', 'u3-q3', 0, 'A. or', FALSE),
('u3-q3_opt_1', 'u3-q3', 1, 'B. otherwise', TRUE),
('u3-q3_opt_2', 'u3-q3', 2, 'C. however', FALSE),
('u3-q3_opt_3', 'u3-q3', 3, 'D. therefore', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q4', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'Nam is very good at drawing, _______ he decided to join the Arts and Crafts club.', 'Trước chỗ trống là dấu phẩy (,) và sau chỗ trống KHÔNG có dấu phẩy -> dùng liên từ kết hợp FANBOYS. Hợp nghĩa kết quả là ''so'' (vì vậy).', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q4_opt_0', 'u3-q4', 0, 'A. so', TRUE),
('u3-q4_opt_1', 'u3-q4', 1, 'B. therefore', FALSE),
('u3-q4_opt_2', 'u3-q4', 2, 'C. however', FALSE),
('u3-q4_opt_3', 'u3-q4', 3, 'D. but', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q5', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'My brother tried very hard in the chess tournament; _______, he couldn''t win the first prize.', 'Dấu `; _______ ,` + nghĩa tương phản (cố gắng hết sức >< không giành giải nhất) -> chọn ''however'' (tuy nhiên).', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q5_opt_0', 'u3-q5', 0, 'A. but', FALSE),
('u3-q5_opt_1', 'u3-q5', 1, 'B. therefore', FALSE),
('u3-q5_opt_2', 'u3-q5', 2, 'C. however', TRUE),
('u3-q5_opt_3', 'u3-q5', 3, 'D. otherwise', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q6', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'Please turn off the TV! I cannot _______ on my English homework.', 'Cụm từ ''concentrate on sth'': tập trung vào việc gì.', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q6_opt_0', 'u3-q6', 0, 'A. connect', FALSE),
('u3-q6_opt_1', 'u3-q6', 1, 'B. concentrate', TRUE),
('u3-q6_opt_2', 'u3-q6', 2, 'C. browse', FALSE),
('u3-q6_opt_3', 'u3-q6', 3, 'D. upload', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q7', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'Many students feel anxious because they want to meet their parents'' high _______.', '''parental expectations'': sự kỳ vọng của cha mẹ. Cụm ''meet expectations'': đáp ứng kỳ vọng.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q7_opt_0', 'u3-q7', 0, 'A. notifications', FALSE),
('u3-q7_opt_1', 'u3-q7', 1, 'B. forums', FALSE),
('u3-q7_opt_2', 'u3-q7', 2, 'C. expectations', TRUE),
('u3-q7_opt_3', 'u3-q7', 3, 'D. tournaments', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q8', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'You need to _______ on to your student account to check the exam schedule.', '''log on to an account'': đăng nhập vào tài khoản.', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q8_opt_0', 'u3-q8', 0, 'A. log', TRUE),
('u3-q8_opt_1', 'u3-q8', 1, 'B. browse', FALSE),
('u3-q8_opt_2', 'u3-q8', 2, 'C. connect', FALSE),
('u3-q8_opt_3', 'u3-q8', 3, 'D. upload', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q9', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'This new dictionary website is very _______. Even primary students can use it easily.', '''user-friendly'': thân thiện với người dùng, dễ sử dụng.', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q9_opt_0', 'u3-q9', 0, 'A. stressful', FALSE),
('u3-q9_opt_1', 'u3-q9', 1, 'B. user-friendly', TRUE),
('u3-q9_opt_2', 'u3-q9', 2, 'C. mature', FALSE),
('u3-q9_opt_3', 'u3-q9', 3, 'D. noisy', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q10', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'Which of the following is a SIMPLE sentence (câu đơn)?', 'Câu B chỉ có 1 cụm Chủ ngữ (Both Minh and Lan) và 1 Vị ngữ (enjoy participating...) nên là Câu đơn. Các câu A, C, D đều có 2 mệnh đề nối bằng and, so, or nên là Câu ghép.', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q10_opt_0', 'u3-q10', 0, 'A. Teenagers often use Messenger, and they also use TikTok.', FALSE),
('u3-q10_opt_1', 'u3-q10', 1, 'B. Both Minh and Lan enjoy participating in the music club.', TRUE),
('u3-q10_opt_2', 'u3-q10', 2, 'C. He felt tired, so he went to bed early.', FALSE),
('u3-q10_opt_3', 'u3-q10', 3, 'D. You can join the sports club, or you can join the chess club.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q11', 'quiz-unit-3', 'Trắc nghiệm củng cố', '_______ pressure can have both positive and negative effects on teenagers.', 'Cụm danh từ cố định: ''peer pressure'' (áp lực đồng trang lứa).', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q11_opt_0', 'u3-q11', 0, 'A. Friend', FALSE),
('u3-q11_opt_1', 'u3-q11', 1, 'B. Mate', FALSE),
('u3-q11_opt_2', 'u3-q11', 2, 'C. Peer', TRUE),
('u3-q11_opt_3', 'u3-q11', 3, 'D. Club', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u3-q12', 'quiz-unit-3', 'Trắc nghiệm củng cố', 'Find the mistake: She <u>wanted</u> to improve her English; <u>so</u>, she <u>joined</u> the English speaking <u>club</u>.', 'Giữa dấu chấm phẩy (;) và dấu phẩy (,) không được dùng ''so'', phải sửa ''so'' thành ''therefore''.', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u3-q12_opt_0', 'u3-q12', 0, 'A. wanted', FALSE),
('u3-q12_opt_1', 'u3-q12', 1, 'B. so', TRUE),
('u3-q12_opt_2', 'u3-q12', 2, 'C. joined', FALSE),
('u3-q12_opt_3', 'u3-q12', 3, 'D. club', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO units (id, course_id, unit_number, semester, title, vi_title, summary, icon, color) VALUES
('unit-4', 'course-eng-8-gs', 4, 1, 'Ethnic Groups of Viet Nam', 'Các dân tộc Việt Nam', 'Từ vựng về văn hóa, nhà sàn, trang phục và đời sống các dân tộc thiểu số; Ngữ âm /k/ và /ɡ/; Câu hỏi Yes/No & Wh-questions; Danh từ đếm được và không đếm được.', '🏔️', '#0284C7')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, vi_title = EXCLUDED.vi_title, summary = EXCLUDED.summary;

INSERT INTO lessons (id, unit_id, title, lesson_type, order_index) VALUES
('unit-4-lesson-vocab', 'unit-4', 'Từ vựng & Ngữ âm Ethnic Groups of Viet Nam', 'vocabulary', 1),
('unit-4-lesson-grammar', 'unit-4', 'Ngữ pháp trọng tâm Ethnic Groups of Viet Nam', 'grammar', 2),
('unit-4-lesson-quiz', 'unit-4', 'Bài tập củng cố Ethnic Groups of Viet Nam', 'practice', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- VOCABULARY FOR UNIT-4
INSERT INTO vocabulary (id, unit_id, lesson_id, word, ipa, word_type, meaning, example, example_vi, tip, order_index) VALUES
('u4-v1', 'unit-4', 'unit-4-lesson-vocab', 'ethnic group', '/ˈeθnɪk ɡruːp/', 'n.phr', 'nhóm dân tộc, dân tộc', 'Viet Nam has 54 ethnic groups living together peacefully.', 'Việt Nam có 54 dân tộc cùng chung sống hòa bình.', 'ethnic minority (dân tộc thiểu số) >< ethnic majority (dân tộc đa số - người Kinh)', 1),
('u4-v2', 'unit-4', 'unit-4-lesson-vocab', 'stilt house', '/stɪlt haʊs/', 'n.phr', 'nhà sàn', 'Many ethnic minority people in the mountains live in stilt houses.', 'Nhiều người dân tộc thiểu số ở vùng núi sống trong nhà sàn.', 'stilt (n): cột sàn; post (n): cột nhà', 2),
('u4-v3', 'unit-4', 'unit-4-lesson-vocab', 'communal house', '/kəˈmjuːnl haʊs/', 'n.phr', 'nhà rông, nhà sinh hoạt cộng đồng', 'The Rong house is the communal house of the Bana and Ede people.', 'Nhà Rông là nhà sinh hoạt cộng đồng của người Ba-na và Ê-đê.', 'Trọng âm của communal rơi vào âm 2: /kəˈmjuːnl/', 3),
('u4-v4', 'unit-4', 'unit-4-lesson-vocab', 'terraced field', '/ˈterəst fiːld/', 'n.phr', 'ruộng bậc thang', 'Mu Cang Chai is famous for its breathtaking terraced fields.', 'Mù Cang Chải nổi tiếng với những thửa ruộng bậc thang tuyệt đẹp.', 'Luôn có ''-ed'' ở chữ terraced: terraced fields', 4),
('u4-v5', 'unit-4', 'unit-4-lesson-vocab', 'costume', '/ˈkɒstjuːm/', 'n', 'trang phục (truyền thống)', 'Ethnic girls look beautiful in their traditional costumes.', 'Các cô gái dân tộc trông rất đẹp trong trang phục truyền thống của họ.', 'Phân biệt: costume (trang phục) và custom (phong tục - học ở Unit 5)', 5),
('u4-v6', 'unit-4', 'unit-4-lesson-vocab', 'weave', '/wiːv/', 'v', 'dệt (vải, thổ cẩm), đan (rổ rá)', 'Tay women learn how to weave cloth from a very young age.', 'Phụ nữ dân tộc Tày học cách dệt vải từ khi còn rất nhỏ.', 'weave cloth (dệt vải), weave baskets (đan rổ)', 6),
('u4-v7', 'unit-4', 'unit-4-lesson-vocab', 'five-colour sticky rice', '/faɪv ˈkʌlə ˈstɪki raɪs/', 'n.phr', 'xôi ngũ sắc', 'Five-colour sticky rice is made with natural roots and leaves.', 'Xôi ngũ sắc được làm từ các loại rễ và lá cây tự nhiên.', 'sticky rice (xôi / gạo nếp) là danh từ KHÔNG đếm được', 7),
('u4-v8', 'unit-4', 'unit-4-lesson-vocab', 'gong', '/ɡɒŋ/', 'n', 'cồng, chiêng', 'The Gong Culture in the Central Highlands is a UNESCO heritage.', 'Không gian văn hóa Cồng chiêng Tây Nguyên là di sản UNESCO.', 'bamboo flute: sáo trúc; musical instrument: nhạc cụ', 8),
('u4-v9', 'unit-4', 'unit-4-lesson-vocab', 'folk dance', '/fəʊk dɑːns/', 'n.phr', 'điệu múa dân gian', 'Visitors love joining the Xoe folk dance around the campfire.', 'Du khách thích tham gia điệu múa xòe dân gian quanh lửa trại.', 'Chữ ''l'' trong folk là âm câm -> đọc là /fəʊk/', 9),
('u4-v10', 'unit-4', 'unit-4-lesson-vocab', 'livestock', '/ˈlaɪvstɒk/', 'n', 'vật nuôi, gia súc', 'Villagers raise livestock and poultry for food and income.', 'Dân làng nuôi gia súc và gia cầm để lấy thức ăn và thu nhập.', 'livestock là danh từ không đếm được / tập hợp', 10),
('u4-v11', 'unit-4', 'unit-4-lesson-vocab', 'overlook', '/ˌəʊvəˈlʊk/', 'v', 'nhìn ra, hướng ra (từ trên cao)', 'Their stilt house overlooks a green valley and a small stream.', 'Ngôi nhà sàn của họ nhìn ra một thung lũng xanh và con suối nhỏ.', 'Trọng âm rơi vào âm tiết thứ 3 /-ˈlʊk/', 11),
('u4-v12', 'unit-4', 'unit-4-lesson-vocab', 'staircase', '/ˈsteəkeɪs/', 'n', 'cầu thang bộ', 'A traditional stilt house usually has an odd number of steps in its staircase.', 'Một ngôi nhà sàn truyền thống thường có số bậc cầu thang là số lẻ.', 'odd number: số lẻ (7, 9 bậc) >< even number: số chẵn', 12),
('u4-v13', 'unit-4', 'unit-4-lesson-vocab', 'minority / majority', '/maɪˈnɒrəti/ - /məˈdʒɒrəti/', 'n', 'thiểu số / đa số', 'The Kinh people account for the majority of Viet Nam''s population.', 'Người Kinh chiếm đa số dân số Việt Nam.', 'Cả 2 từ đều có trọng âm rơi vào âm tiết thứ 2 (trước đuôi -ity)', 13),
('u4-v14', 'unit-4', 'unit-4-lesson-vocab', 'lowland / highland', '/ˈləʊlənd/ - /ˈhaɪlənd/', 'n', 'vùng đồng bằng (vùng thấp) / vùng cao nguyên (vùng cao)', 'The Central Highlands is home to many ethnic minority groups.', 'Tây Nguyên là quê hương của nhiều dân tộc thiểu số.', 'The Central Highlands = Tây Nguyên', 14)
ON CONFLICT (id) DO UPDATE SET meaning = EXCLUDED.meaning, example = EXCLUDED.example, tip = EXCLUDED.tip;

-- GRAMMAR FOR UNIT-4
INSERT INTO grammar_topics (id, unit_id, lesson_id, topic_title, formula, explanation, exam_traps, order_index) VALUES
('u4-g1', 'unit-4', 'unit-4-lesson-grammar', '1. Danh từ đếm được (Countable) & Danh từ không đếm được (Uncountable)', NULL, 'a) Danh từ đếm được (Countable nouns): Có dạng số ít (a stilt house, an ethnic group, a costume) và số nhiều (stilt houses, costumes, people, children, women, men, teeth, feet).
• Các lượng từ đi với Danh từ đếm được số nhiều: many, a few (một vài - đủ dùng), few (rất ít - hầu như không), several, a number of.
b) Danh từ KHÔNG đếm được (Uncountable nouns): KHÔNG có dạng số nhiều (không thêm -s/es), KHÔNG dùng a/an đằng trước, động từ theo sau luôn chia SỐ ÍT.
• Các danh từ không đếm được CỰC HAY RA THI ở lớp 8: information (thông tin), furniture (đồ nội thất), advice (lời khuyên), luggage/baggage (hành lý), homework, housework, work, money, time, rice (lúa/gạo), sticky rice (xôi), water, milk, butter, sugar, music, nature, weather, traffic, livestock.
• Các lượng từ đi với Danh từ KHÔNG đếm được: much, a little (một chút), little (rất ít).
c) Lượng từ dùng cho CẢ HAI loại: some (câu khẳng định / lời mời), any (câu phủ định / nghi vấn), a lot of / lots of.', 'Bẫy đề thi số 1: Thấy ''information'', ''furniture'', ''advice'', ''luggage'', ''rice'', ''water'' -> TUYỆT ĐỐI KHÔNG chọn many / a few / a / an! Phải chọn much / a little / some / any.
Bẫy đề thi số 2: Thấy ''people'', ''children'', ''women'', ''men'', ''cattle'' -> Đây là danh từ ĐẾM ĐƯỢC SỐ NHIỀU bất quy tắc (dù không có chữ ''s'' ở cuối) -> Phải chọn many / a few (KHÔNG chọn much / a little)!', 1),
('u4-g2', 'unit-4', 'unit-4-lesson-grammar', '2. Câu hỏi Yes/No và Câu hỏi có từ để hỏi (Wh-questions)', NULL, '• Yes/No question: Be + S + ...? HOẶC Do/Does/Did/Modal + S + V(nguyên thể)...?
• Wh-question: Wh-word (What, Where, When, Why, Who, Which, Whose, How, How many, How much, How often, How far...) + trợ động từ + S + V?
Lưu ý phân biệt: ''Which'' dùng khi có sự lựa chọn giới hạn (Which ethnic group has a larger population, the Tay or the Thai?).', 'Trong câu hỏi quá khứ đơn có ''Did'', động từ chính phải trả về NGUYÊN THỂ (Where did you go? - KHÔNG dùng Where did you went?).', 2)
ON CONFLICT (id) DO UPDATE SET topic_title = EXCLUDED.topic_title, explanation = EXCLUDED.explanation, formula = EXCLUDED.formula, exam_traps = EXCLUDED.exam_traps;

-- EXERCISE (PRACTICE QUIZ) FOR UNIT-4
INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('quiz-unit-4', 'course-eng-8-gs', 'unit-4', 'unit-4-lesson-quiz', 'Bài tập củng cố Ethnic Groups of Viet Nam', 'unit_quiz', 'Luyện tập', 15, 'Kiến thức Ethnic Groups of Viet Nam', '12 câu trắc nghiệm kiểm tra từ vựng, ngữ pháp và phát âm')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q1', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'Choose the word whose underlined part is pronounced differently: A. <u>c</u>ultural   B. <u>c</u>ommunal   C. <u>c</u>ostume   D. <u>c</u>ity', 'Chữ ''c'' trong ''city'' phát âm là /s/ (/ˈsɪti/). Trong các từ cultural, communal, costume đều phát âm là /k/.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q1_opt_0', 'u4-q1', 0, 'A. cultural', FALSE),
('u4-q1_opt_1', 'u4-q1', 1, 'B. communal', FALSE),
('u4-q1_opt_2', 'u4-q1', 2, 'C. costume', FALSE),
('u4-q1_opt_3', 'u4-q1', 3, 'D. city', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q2', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'Choose the word whose underlined part is pronounced differently: A. <u>g</u>ong   B. villa<u>g</u>e   C. <u>g</u>arden   D. <u>g</u>ather', 'Chữ ''g'' trong ''village'' phát âm là /dʒ/ (/ˈvɪlɪdʒ/). Các từ gong, garden, gather phát âm là /ɡ/.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q2_opt_0', 'u4-q2', 0, 'A. gong', FALSE),
('u4-q2_opt_1', 'u4-q2', 1, 'B. village', TRUE),
('u4-q2_opt_2', 'u4-q2', 2, 'C. garden', FALSE),
('u4-q2_opt_3', 'u4-q2', 3, 'D. gather', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q3', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'How _______ ethnic minority groups are there in Viet Nam?', '''groups'' là danh từ đếm được số nhiều -> dùng ''How many''.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q3_opt_0', 'u4-q3', 0, 'A. much', FALSE),
('u4-q3_opt_1', 'u4-q3', 1, 'B. many', TRUE),
('u4-q3_opt_2', 'u4-q3', 2, 'C. little', FALSE),
('u4-q3_opt_3', 'u4-q3', 3, 'D. a little', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q4', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'We need to find _______ information about the Ede''s communal house for our presentation.', '''information'' là danh từ KHÔNG đếm được nên loại ''a few'', ''many'', ''an''. Chọn ''some''.', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q4_opt_0', 'u4-q4', 0, 'A. a few', FALSE),
('u4-q4_opt_1', 'u4-q4', 1, 'B. many', FALSE),
('u4-q4_opt_2', 'u4-q4', 2, 'C. some', TRUE),
('u4-q4_opt_3', 'u4-q4', 3, 'D. an', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q5', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'There is only _______ sticky rice left in the pot, so we should cook some more.', '''sticky rice'' (xôi) là danh từ không đếm được trong câu khẳng định (''only a little'' = chỉ còn một chút).', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q5_opt_0', 'u4-q5', 0, 'A. a few', FALSE),
('u4-q5_opt_1', 'u4-q5', 1, 'B. many', FALSE),
('u4-q5_opt_2', 'u4-q5', 2, 'C. a little', TRUE),
('u4-q5_opt_3', 'u4-q5', 3, 'D. any', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q6', 'quiz-unit-4', 'Trắc nghiệm củng cố', '_______ ethnic group has a larger population, the Tay or the Hmong?', 'Câu hỏi đưa ra sự lựa chọn cụ thể giữa 2 đối tượng (''the Tay or the Hmong'') -> dùng ''Which''.', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q6_opt_0', 'u4-q6', 0, 'A. What', FALSE),
('u4-q6_opt_1', 'u4-q6', 1, 'B. Which', TRUE),
('u4-q6_opt_2', 'u4-q6', 2, 'C. Who', FALSE),
('u4-q6_opt_3', 'u4-q6', 3, 'D. Whose', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q7', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'The Bahnars and Edés often hold important village ceremonies in their _______ house (Rong house).', 'Nhà Rông là nhà sinh hoạt cộng đồng: ''communal house''.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q7_opt_0', 'u4-q7', 0, 'A. stilt', FALSE),
('u4-q7_opt_1', 'u4-q7', 1, 'B. communal', TRUE),
('u4-q7_opt_2', 'u4-q7', 2, 'C. terraced', FALSE),
('u4-q7_opt_3', 'u4-q7', 3, 'D. highland', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q8', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'Farmers in mountainous areas grow rice on _______ fields along the hillsides.', '''terraced fields'': ruộng bậc thang trên sườn đồi núi.', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q8_opt_0', 'u4-q8', 0, 'A. terraced', TRUE),
('u4-q8_opt_1', 'u4-q8', 1, 'B. communal', FALSE),
('u4-q8_opt_2', 'u4-q8', 2, 'C. musical', FALSE),
('u4-q8_opt_3', 'u4-q8', 3, 'D. folk', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q9', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'Look at the wooden _______ in this stilt house! It is very simple and traditional.', '''furniture'' (đồ đạc nội thất) là danh từ KHÔNG đếm được -> không thêm ''s'', không dùng ''a'' hay ''many''.', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q9_opt_0', 'u4-q9', 0, 'A. furnitures', FALSE),
('u4-q9_opt_1', 'u4-q9', 1, 'B. a furniture', FALSE),
('u4-q9_opt_2', 'u4-q9', 2, 'C. furniture', TRUE),
('u4-q9_opt_3', 'u4-q9', 3, 'D. many furniture', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q10', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'Traditional _______ of ethnic minority women are often colourful and decorated with silver coins.', '''costumes'': trang phục truyền thống (được trang trí nhiều màu sắc).', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q10_opt_0', 'u4-q10', 0, 'A. customs', FALSE),
('u4-q10_opt_1', 'u4-q10', 1, 'B. costumes', TRUE),
('u4-q10_opt_2', 'u4-q10', 2, 'C. staircases', FALSE),
('u4-q10_opt_3', 'u4-q10', 3, 'D. posts', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q11', 'quiz-unit-4', 'Trắc nghiệm củng cố', '_______ did you travel to Ha Giang last summer? — By coach with my family.', 'Câu trả lời là ''By coach'' (bằng xe khách - chỉ phương tiện đi lại) -> câu hỏi dùng ''How''.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q11_opt_0', 'u4-q11', 0, 'A. Where', FALSE),
('u4-q11_opt_1', 'u4-q11', 1, 'B. When', FALSE),
('u4-q11_opt_2', 'u4-q11', 2, 'C. How', TRUE),
('u4-q11_opt_3', 'u4-q11', 3, 'D. Why', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u4-q12', 'quiz-unit-4', 'Trắc nghiệm củng cố', 'Find the mistake: How <u>much</u> <u>people</u> <u>live</u> in a traditional Ede long <u>house</u>?', '''people'' là danh từ đếm được số nhiều -> phải sửa ''much'' thành ''many'' (How many people).', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u4-q12_opt_0', 'u4-q12', 0, 'A. much', TRUE),
('u4-q12_opt_1', 'u4-q12', 1, 'B. people', FALSE),
('u4-q12_opt_2', 'u4-q12', 2, 'C. live', FALSE),
('u4-q12_opt_3', 'u4-q12', 3, 'D. house', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO units (id, course_id, unit_number, semester, title, vi_title, summary, icon, color) VALUES
('unit-5', 'course-eng-8-gs', 5, 1, 'Our Customs and Traditions', 'Phong tục và Truyền thống', 'Từ vựng về lễ hội, phong tục tập quán Việt Nam; Ngữ âm /n/ và /ŋ/; Mạo từ (a, an, the) và Trường hợp không dùng mạo từ (Zero article Ø).', '🏮', '#DC2626')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, vi_title = EXCLUDED.vi_title, summary = EXCLUDED.summary;

INSERT INTO lessons (id, unit_id, title, lesson_type, order_index) VALUES
('unit-5-lesson-vocab', 'unit-5', 'Từ vựng & Ngữ âm Our Customs and Traditions', 'vocabulary', 1),
('unit-5-lesson-grammar', 'unit-5', 'Ngữ pháp trọng tâm Our Customs and Traditions', 'grammar', 2),
('unit-5-lesson-quiz', 'unit-5', 'Bài tập củng cố Our Customs and Traditions', 'practice', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- VOCABULARY FOR UNIT-5
INSERT INTO vocabulary (id, unit_id, lesson_id, word, ipa, word_type, meaning, example, example_vi, tip, order_index) VALUES
('u5-v1', 'unit-5', 'unit-5-lesson-vocab', 'custom / tradition', '/ˈkʌstəm/ - /trəˈdɪʃn/', 'n', 'phong tục / truyền thống', 'It is a custom in my family to have dinner together on New Year''s Eve.', 'Ăn tối cùng nhau vào đêm Giao thừa là một phong tục trong gia đình tôi.', 'have a custom of + V-ing; break with tradition (phá vỡ truyền thống)', 1),
('u5-v2', 'unit-5', 'unit-5-lesson-vocab', 'worship ancestors', '/ˈwɜːʃɪp ˈænsestəz/', 'v.phr', 'thờ cúng tổ tiên', 'Worshipping ancestors is an important tradition of Vietnamese people.', 'Thờ cúng tổ tiên là một truyền thống quan trọng của người Việt.', 'whale worship: tục thờ cá Ông (cá voi) của ngư dân vùng biển', 2),
('u5-v3', 'unit-5', 'unit-5-lesson-vocab', 'longevity', '/lɒnˈdʒevəti/', 'n', 'sự trường thọ, sống lâu', 'We held a longevity ceremony for my 80-year-old grandmother.', 'Chúng tôi tổ chức lễ mừng thọ cho bà nội 80 tuổi.', 'longevity ceremony: lễ mừng thọ. Trọng âm âm 2: /lɒnˈdʒevəti/', 3),
('u5-v4', 'unit-5', 'unit-5-lesson-vocab', 'family reunion', '/ˈfæməli ˌriːˈjuːniən/', 'n.phr', 'cuộc sum họp, đoàn tụ gia đình', 'Tet is the biggest occasion for family reunions in Viet Nam.', 'Tết là dịp lớn nhất để sum họp gia đình ở Việt Nam.', 'family bonding: sự gắn kết tình cảm gia đình', 4),
('u5-v5', 'unit-5', 'unit-5-lesson-vocab', 'ornamental tree', '/ˌɔːnəˈmentl triː/', 'n.phr', 'cây cảnh trang trí', 'Kumquat trees and peach blossoms are popular ornamental trees at Tet.', 'Cây quất và hoa đào là những loại cây cảnh phổ biến vào dịp Tết.', 'kumquat tree (cây quất), peach blossom (hoa đào), apricot blossom (hoa mai)', 5),
('u5-v6', 'unit-5', 'unit-5-lesson-vocab', 'bamboo pole', '/ˌbæmˈbuː pəʊl/', 'n.phr', 'cây nêu (ngày Tết)', 'In the past, villagers put up a bamboo pole to chase away bad luck.', 'Ngày xưa, dân làng dựng cây nêu để xua đuổi điều xui xẻo.', 'chase away bad luck / evil spirits: xua đuổi vận xui / tà ma', 6),
('u5-v7', 'unit-5', 'unit-5-lesson-vocab', 'offering', '/ˈɒfərɪŋ/', 'n', 'đồ cúng, lễ vật', 'People prepare offerings of fruit, flowers and incense for the altar.', 'Mọi người chuẩn bị lễ vật gồm trái cây, hoa và hương lên bàn thờ.', 'food offerings: đồ lễ cúng', 7),
('u5-v8', 'unit-5', 'unit-5-lesson-vocab', 'festival goer', '/ˈfestɪvl ˈɡəʊə(r)/', 'n.phr', 'người đi trẩy hội, du khách tham gia lễ hội', 'Thousands of festival goers gathered at the Hung Kings Temple.', 'Hàng nghìn người đi lễ hội đã tập trung tại Đền Hùng.', 'go -> goer (người đi đến đâu đó)', 8),
('u5-v9', 'unit-5', 'unit-5-lesson-vocab', 'martial arts', '/ˌmɑːʃl ˈɑːts/', 'n.phr', 'võ thuật', 'The festival features traditional games and martial arts performances.', 'Lễ hội có các trò chơi truyền thống và màn biểu diễn võ thuật.', 'Luôn có ''s'' ở arts: martial arts', 9),
('u5-v10', 'unit-5', 'unit-5-lesson-vocab', 'lantern', '/ˈlæntən/', 'n', 'đèn lồng', 'Children carry colourful lanterns during the Mid-Autumn Festival.', 'Trẻ em rước những chiếc đèn lồng rực rỡ trong Tết Trung thu.', 'release lanterns: thả đèn hoa đăng / đèn lồng', 10),
('u5-v11', 'unit-5', 'unit-5-lesson-vocab', 'table manners', '/ˈteɪbl ˈmænəz/', 'n.phr', 'phép tắc trên bàn ăn', 'Inviting elders to eat first is one of Vietnamese table manners.', 'Mời người lớn tuổi ăn trước là một trong những phép tắc bàn ăn của người Việt.', 'manners (số nhiều): phép lịch sự, quy tắc ứng xử', 11),
('u5-v12', 'unit-5', 'unit-5-lesson-vocab', 'acrobatics', '/ˌækrəˈbætɪks/', 'n', 'màn nhào lộn, xiếc', 'The lion dance includes exciting acrobatics and drum music.', 'Múa lân bao gồm những màn nhào lộn hấp dẫn và tiếng trống rộn ràng.', 'Trọng âm rơi vào âm tiết thứ 3 /-ˈbæt-/', 12),
('u5-v13', 'unit-5', 'unit-5-lesson-vocab', 'coastal', '/ˈkəʊstl/', 'adj', 'thuộc vùng ven biển', 'Whale worship is very popular in Vietnamese coastal villages.', 'Tục thờ cá Ông rất phổ biến ở các làng ven biển Việt Nam.', 'coast (n: bờ biển) -> coastal (adj: ven biển)', 13),
('u5-v14', 'unit-5', 'unit-5-lesson-vocab', 'carp', '/kɑːp/', 'n', 'cá chép', 'People release live carps into rivers on the 23rd of the last lunar month.', 'Mọi người thả cá chép sống ra sông vào ngày 23 tháng Chạp.', 'Land Genie and Kitchen Gods: Ông Công Ông Táo', 14)
ON CONFLICT (id) DO UPDATE SET meaning = EXCLUDED.meaning, example = EXCLUDED.example, tip = EXCLUDED.tip;

-- GRAMMAR FOR UNIT-5
INSERT INTO grammar_topics (id, unit_id, lesson_id, topic_title, formula, explanation, exam_traps, order_index) VALUES
('u5-g1', 'unit-5', 'unit-5-lesson-grammar', '1. Mạo từ A / An / The và Không dùng mạo từ (Zero article Ø)', NULL, 'a) Mạo từ bất định ''A / An'': chỉ đứng trước danh từ ĐẾM ĐƯỢC SỐ ÍT khi nhắc đến lần đầu hoặc mang nghĩa ''một''.
• Dùng ''an'' trước nguyên âm (u, e, o, a, i) tính theo CÁCH PHÁT ÂM: an ornamental tree, an offering, an hour (h câm), an honest boy.
• Dùng ''a'' trước phụ âm (tính theo cách phát âm): a custom, a lantern, a uniform (/ˈjuːnɪfɔːm/), a university (/ˌjuːnɪˈvɜːsəti/).
b) Mạo từ xác định ''The'':
• Vật/người đã xác định hoặc được nhắc lại lần thứ 2.
• Vật duy nhất: the sun, the moon, the earth, the world, the capital.
• Trước so sánh nhất (the biggest) và số thứ tự (the first, the second).
• Trước tên dân tộc để chỉ cả cộng đồng: the Kinh, the Tay, the Ede, the Vietnamese.
• Trước nhạc cụ: play the guitar / play the piano / play the bamboo flute.
• Trước danh từ có ''of'' xác định phía sau: the tradition of worshipping ancestors.
c) KHÔNG dùng mạo từ (Zero article - kí hiệu Ø) — TRỌNG TÂM ĐỀ THI:
• Trước danh từ số nhiều hoặc danh từ không đếm được khi nói chung chung: Ø Festivals are fun. / Ø Sticky rice is delicious.
• Trước các bữa ăn: have Ø breakfast / Ø lunch / Ø dinner.
• Trước các môn thể thao, trò chơi: play Ø badminton / Ø chess / Ø tug of war.
• Trước thứ, tháng, năm, mùa (nói chung) và hầu hết các ngày lễ Tết ngắn: at Ø Tet, on Ø Sundays, in Ø January, on Ø Christmas Day, on Ø New Year''s Eve.
• Trước tên quốc gia (trừ các nước có Kingdom, States, Republic, Philippines, Netherlands): in Ø Viet Nam, in Ø Japan (NHƯNG: the UK, the USA).', 'Cẩn thận bẫy ''a/an'': ''a uniform'', ''a university'', ''a European country'' (vì chữ u/eu ở đây phát âm là /juː/ - phụ âm /j/!). Ngược lại: ''an hour'', ''an MC'', ''an SOS''!
Cẩn thận với Tết và Lễ hội: ''at Ø Tet'' (không có mạo từ), NHƯNG ''the Mid-Autumn Festival'', ''the Hung Kings Temple Festival'' (các lễ hội có chữ Festival thường dùng ''the'').', 1)
ON CONFLICT (id) DO UPDATE SET topic_title = EXCLUDED.topic_title, explanation = EXCLUDED.explanation, formula = EXCLUDED.formula, exam_traps = EXCLUDED.exam_traps;

-- EXERCISE (PRACTICE QUIZ) FOR UNIT-5
INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('quiz-unit-5', 'course-eng-8-gs', 'unit-5', 'unit-5-lesson-quiz', 'Bài tập củng cố Our Customs and Traditions', 'unit_quiz', 'Luyện tập', 15, 'Kiến thức Our Customs and Traditions', '12 câu trắc nghiệm kiểm tra từ vựng, ngữ pháp và phát âm')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q1', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'Choose the word whose underlined part is pronounced differently: A. la<u>n</u>tern   B. <u>n</u>ature   C. mo<u>n</u>k   D. ceremo<u>n</u>y', 'Chữ ''n'' trong ''monk'' đứng trước âm /k/ nên phát âm là /ŋ/ (/mʌŋk/). Trong lantern, nature, ceremony chữ ''n'' phát âm là /n/.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q1_opt_0', 'u5-q1', 0, 'A. lantern', FALSE),
('u5-q1_opt_1', 'u5-q1', 1, 'B. nature', FALSE),
('u5-q1_opt_2', 'u5-q1', 2, 'C. monk', TRUE),
('u5-q1_opt_3', 'u5-q1', 3, 'D. ceremony', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q2', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'Choose the word whose underlined part is pronounced differently: A. thi<u>n</u>k   B. la<u>n</u>guage   C. lon<u>g</u>evity   D. tha<u>n</u>ksgiving', 'Trong ''longevity'' (/lɒnˈdʒevəti/), âm tiết là /lɒn-/ và /-dʒev-/. Còn trong think, language, thanksgiving chữ ''n'' đều phát âm là /ŋ/.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q2_opt_0', 'u5-q2', 0, 'A. think', FALSE),
('u5-q2_opt_1', 'u5-q2', 1, 'B. language', FALSE),
('u5-q2_opt_2', 'u5-q2', 2, 'C. longevity', TRUE),
('u5-q2_opt_3', 'u5-q2', 3, 'D. thanksgiving', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q3', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'In Viet Nam, people often buy _______ ornamental tree such as a kumquat tree for Tet.', '''tree'' là danh từ đếm được số ít nhắc đến chung (''một cây cảnh''), đứng trước ''ornamental'' bắt đầu bằng nguyên âm /ɔː/ -> dùng ''an''.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q3_opt_0', 'u5-q3', 0, 'A. a', FALSE),
('u5-q3_opt_1', 'u5-q3', 1, 'B. an', TRUE),
('u5-q3_opt_2', 'u5-q3', 2, 'C. the', FALSE),
('u5-q3_opt_3', 'u5-q3', 3, 'D. Ø (no article)', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q4', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'My family always has a big dinner together on _______ New Year''s Eve.', 'Trước các dịp lễ như ''New Year''s Eve'', ''Tet'', ''Christmas'' ta KHÔNG dùng mạo từ (Ø).', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q4_opt_0', 'u5-q4', 0, 'A. a', FALSE),
('u5-q4_opt_1', 'u5-q4', 1, 'B. an', FALSE),
('u5-q4_opt_2', 'u5-q4', 2, 'C. the', FALSE),
('u5-q4_opt_3', 'u5-q4', 3, 'D. Ø (no article)', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q5', 'quiz-unit-5', 'Trắc nghiệm củng cố', '_______ Tay are the second largest ethnic group in Viet Nam after _______ Kinh.', 'Khi nói về cả một cộng đồng dân tộc (The Tay, The Kinh, The Ede), ta dùng mạo từ ''the''.', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q5_opt_0', 'u5-q5', 0, 'A. The / the', TRUE),
('u5-q5_opt_1', 'u5-q5', 1, 'B. Ø / Ø', FALSE),
('u5-q5_opt_2', 'u5-q5', 2, 'C. A / a', FALSE),
('u5-q5_opt_3', 'u5-q5', 3, 'D. The / Ø', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q6', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'Students at my school have to wear _______ uniform on Mondays and Fridays.', '''uniform'' bắt đầu bằng chữ ''u'' nhưng phát âm là /ˈjuːnɪfɔːm/ (phụ âm /j/) -> phải dùng mạo từ ''a'' (a uniform).', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q6_opt_0', 'u5-q6', 0, 'A. an', FALSE),
('u5-q6_opt_1', 'u5-q6', 1, 'B. a', TRUE),
('u5-q6_opt_2', 'u5-q6', 2, 'C. the', FALSE),
('u5-q6_opt_3', 'u5-q6', 3, 'D. Ø', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q7', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'We held a _______ ceremony last Sunday to celebrate my grandparents turning 85.', '''longevity ceremony'': lễ mừng thọ (mừng ông bà 85 tuổi).', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q7_opt_0', 'u5-q7', 0, 'A. longevity', TRUE),
('u5-q7_opt_1', 'u5-q7', 1, 'B. lantern', FALSE),
('u5-q7_opt_2', 'u5-q7', 2, 'C. coastal', FALSE),
('u5-q7_opt_3', 'u5-q7', 3, 'D. martial', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q8', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'People put up a bamboo pole at Tet to _______ away bad luck and evil spirits.', 'Cụm từ cố định: ''chase away bad luck'' (xua đuổi vận xui).', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q8_opt_0', 'u5-q8', 0, 'A. worship', FALSE),
('u5-q8_opt_1', 'u5-q8', 1, 'B. chase', TRUE),
('u5-q8_opt_2', 'u5-q8', 2, 'C. release', FALSE),
('u5-q8_opt_3', 'u5-q8', 3, 'D. admire', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q9', 'quiz-unit-5', 'Trắc nghiệm củng cố', '_______ ancestors is a core cultural value that shows gratitude to our roots.', '''worship ancestors'': thờ cúng tổ tiên.', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q9_opt_0', 'u5-q9', 0, 'A. Worshipping', TRUE),
('u5-q9_opt_1', 'u5-q9', 1, 'B. Chasing', FALSE),
('u5-q9_opt_2', 'u5-q9', 2, 'C. Greeting', FALSE),
('u5-q9_opt_3', 'u5-q9', 3, 'D. Weaving', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q10', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'Using both hands when giving something to an elder is a good _______ in Viet Nam.', '''custom'': phong tục, thói quen ứng xử tốt đẹp (không nhầm với ''costume'' là trang phục).', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q10_opt_0', 'u5-q10', 0, 'A. costume', FALSE),
('u5-q10_opt_1', 'u5-q10', 1, 'B. custom', TRUE),
('u5-q10_opt_2', 'u5-q10', 2, 'C. offering', FALSE),
('u5-q10_opt_3', 'u5-q10', 3, 'D. lantern', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q11', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'Wait for me! I will be ready in half _______ hour.', '''hour'' có chữ ''h'' câm, phát âm bắt đầu bằng nguyên âm /ˈaʊə(r)/ -> dùng ''an'' (half an hour: nửa tiếng).', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q11_opt_0', 'u5-q11', 0, 'A. a', FALSE),
('u5-q11_opt_1', 'u5-q11', 1, 'B. an', TRUE),
('u5-q11_opt_2', 'u5-q11', 2, 'C. the', FALSE),
('u5-q11_opt_3', 'u5-q11', 3, 'D. Ø', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u5-q12', 'quiz-unit-5', 'Trắc nghiệm củng cố', 'Find the mistake: My father <u>usually</u> plays <u>the</u> badminton <u>with</u> his neighbours <u>in</u> the afternoon.', 'Trước tên các môn thể thao (badminton, football, chess) KHÔNG dùng mạo từ ''the'' -> bỏ ''the'' (plays badminton).', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u5-q12_opt_0', 'u5-q12', 0, 'A. usually', FALSE),
('u5-q12_opt_1', 'u5-q12', 1, 'B. the', TRUE),
('u5-q12_opt_2', 'u5-q12', 2, 'C. with', FALSE),
('u5-q12_opt_3', 'u5-q12', 3, 'D. in', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO units (id, course_id, unit_number, semester, title, vi_title, summary, icon, color) VALUES
('unit-6', 'course-eng-8-gs', 6, 1, 'Lifestyles', 'Lối sống', 'Từ vựng về cách chào hỏi, ẩm thực đường phố, lối sống hiện đại & truyền thống; Ngữ âm /br/ và /pr/; Thì Tương lai đơn (Will) và Câu điều kiện loại 1 (First Conditional).', '🌍', '#7C3AED')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, vi_title = EXCLUDED.vi_title, summary = EXCLUDED.summary;

INSERT INTO lessons (id, unit_id, title, lesson_type, order_index) VALUES
('unit-6-lesson-vocab', 'unit-6', 'Từ vựng & Ngữ âm Lifestyles', 'vocabulary', 1),
('unit-6-lesson-grammar', 'unit-6', 'Ngữ pháp trọng tâm Lifestyles', 'grammar', 2),
('unit-6-lesson-quiz', 'unit-6', 'Bài tập củng cố Lifestyles', 'practice', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- VOCABULARY FOR UNIT-6
INSERT INTO vocabulary (id, unit_id, lesson_id, word, ipa, word_type, meaning, example, example_vi, tip, order_index) VALUES
('u6-v1', 'unit-6', 'unit-6-lesson-vocab', 'lifestyle', '/ˈlaɪfstaɪl/', 'n', 'lối sống, phong cách sống', 'Doing exercise regularly is part of a healthy lifestyle.', 'Tập thể dục đều đặn là một phần của lối sống lành mạnh.', 'healthy lifestyle (lối sống lành mạnh), nomadic lifestyle (lối sống du mục)', 1),
('u6-v2', 'unit-6', 'unit-6-lesson-vocab', 'greet / greeting', '/ɡriːt/ - /ˈɡriːtɪŋ/', 'v, n', 'chào hỏi / lời chào, cách chào', 'Japanese people usually bow to greet each other.', 'Người Nhật thường cúi đầu để chào nhau.', 'bow (cúi chào), shake hands (bắt tay), hug (ôm)', 2),
('u6-v3', 'unit-6', 'unit-6-lesson-vocab', 'in the habit of', '/ɪn ðə ˈhæbɪt əv/', 'phr', 'có thói quen làm gì', 'My grandfather is in the habit of drinking green tea every morning.', 'Ông tôi có thói quen uống trà xanh mỗi sáng.', 'be in the habit of + V-ing!', 3),
('u6-v4', 'unit-6', 'unit-6-lesson-vocab', 'in a hurry', '/ɪn ə ˈhʌri/', 'phr', 'đang vội vàng, gấp gáp', 'City dwellers often eat street food when they are in a hurry.', 'Người dân thành phố thường ăn đồ ăn đường phố khi họ đang vội.', 'Cụm cố định: in a hurry', 4),
('u6-v5', 'unit-6', 'unit-6-lesson-vocab', 'dogsled', '/ˈdɒɡsled/', 'n', 'xe trượt tuyết do chó kéo', 'In Alaska, people still use dogsleds to travel across the snow.', 'Ở Alaska, người ta vẫn dùng xe chó kéo để di chuyển trên tuyết.', 'musher (n): người điều khiển xe trượt tuyết chó kéo; igloo (n): lều tuyết', 5),
('u6-v6', 'unit-6', 'unit-6-lesson-vocab', 'native art', '/ˈneɪtɪv ɑːt/', 'n.phr', 'nghệ thuật bản địa', 'Tourists are fascinated by the native art of the local tribes.', 'Du khách bị cuốn hút bởi nghệ thuật bản địa của các bộ tộc địa phương.', 'tribal dance: điệu nhảy bộ tộc', 6),
('u6-v7', 'unit-6', 'unit-6-lesson-vocab', 'make crafts', '/meɪk krɑːfts/', 'v.phr', 'làm đồ thủ công mỹ nghệ', 'Villagers earn a living by weaving and making crafts.', 'Dân làng kiếm sống bằng nghề dệt và làm đồ thủ công.', 'Đi với MAKE: make crafts', 7),
('u6-v8', 'unit-6', 'unit-6-lesson-vocab', 'online learning', '/ˌɒnˈlaɪn ˈlɜːnɪŋ/', 'n.phr', 'việc học trực tuyến', 'Online learning allows students to study from anywhere.', 'Học trực tuyến cho phép học sinh học từ bất cứ đâu.', 'Trái nghĩa với offline / face-to-face learning', 8),
('u6-v9', 'unit-6', 'unit-6-lesson-vocab', 'independent', '/ˌɪndɪˈpendənt/', 'adj', 'tự lập, độc lập', 'Studying online helps learners become more independent.', 'Học trực tuyến giúp người học trở nên tự lập hơn.', 'Trọng âm rơi vào âm tiết thứ 3 /-ˈpen-/', 9),
('u6-v10', 'unit-6', 'unit-6-lesson-vocab', 'interactive', '/ˌɪntərˈæktɪv/', 'adj', 'có tính tương tác', 'Teachers use interactive games to make lessons more exciting.', 'Giáo viên dùng các trò chơi tương tác để làm bài học thú vị hơn.', 'interact (v) -> interaction (n) -> interactive (adj)', 10),
('u6-v11', 'unit-6', 'unit-6-lesson-vocab', 'impact', '/ˈɪmpækt/', 'n', 'sự tác động, ảnh hưởng', 'Modern technology has a huge impact on our daily lifestyle.', 'Công nghệ hiện đại có tác động to lớn đến lối sống hàng ngày của chúng ta.', 'have an impact ON sth = have an effect ON sth', 11),
('u6-v12', 'unit-6', 'unit-6-lesson-vocab', 'maintain', '/meɪnˈteɪn/', 'v', 'duy trì, giữ gìn', 'Despite modernization, they still maintain their traditional lifestyle.', 'Mặc dù hiện đại hóa, họ vẫn duy trì lối sống truyền thống của mình.', 'Trọng âm rơi vào âm 2: /meɪnˈteɪn/', 12),
('u6-v13', 'unit-6', 'unit-6-lesson-vocab', 'street food', '/striːt fuːd/', 'n.phr', 'ẩm thực / thức ăn đường phố', 'Vietnamese street food like Pho and Banh Mi is famous worldwide.', 'Ẩm thực đường phố Việt Nam như Phở và Bánh mì nổi tiếng toàn thế giới.', 'street vendor: người bán hàng rong', 13),
('u6-v14', 'unit-6', 'unit-6-lesson-vocab', 'nomadic', '/nəʊˈmædɪk/', 'adj', 'thuộc về du mục (nay đây mai đó)', 'Mongolian herders lead a nomadic life on the steppes.', 'Những người chăn gia súc Mông Cổ sống cuộc đời du mục trên thảo nguyên.', 'nomad (n: người du mục) -> nomadic (adj: thuộc du mục)', 14)
ON CONFLICT (id) DO UPDATE SET meaning = EXCLUDED.meaning, example = EXCLUDED.example, tip = EXCLUDED.tip;

-- GRAMMAR FOR UNIT-6
INSERT INTO grammar_topics (id, unit_id, lesson_id, topic_title, formula, explanation, exam_traps, order_index) VALUES
('u6-g1', 'unit-6', 'unit-6-lesson-grammar', '1. Thì Tương lai đơn (Future Simple: will / won''t + V)', NULL, '• Công thức: (+) S + will + V(nguyên thể) | (-) S + will not (won''t) + V | (?) Will + S + V?
• Cách dùng: Diễn tả dự đoán về tương lai (thường đi với I think, I believe, perhaps, probably, maybe), quyết định ngay tại thời điểm nói, lời hứa (I promise), hoặc lời đề nghị.
• Dấu hiệu: tomorrow, next week/month/year, in the future, soon, in + năm tương lai (in 2030).', 'Sau ''will'' hoặc ''won''t'' động từ LUÔN ở dạng nguyên thể không ''to'' (Ví dụ: She will be 14 next month / It won''t rain tomorrow).', 1),
('u6-g2', 'unit-6', 'unit-6-lesson-grammar', '2. Câu điều kiện loại 1 (First Conditional) — CỰC QUAN TRỌNG CHO THI HỌC KÌ 1', NULL, '• Dùng để diễn tả sự việc CÓ THỂ XẢY RA ở hiện tại hoặc tương lai.
• Công thức chuẩn: [Mệnh đề IF: If + S + V(hiện tại đơn - V/Vs/es, am/is/are, don''t/doesn''t + V)], [Mệnh đề chính: S + will / won''t (hoặc can / may / should) + V(nguyên thể)].
• Ví dụ: If you study hard, you will pass the final exam easily.
• Ví dụ: If she doesn''t hurry, she will miss the school bus.
• CẤU TRÚC UNLESS (Trừ khi / Nếu... không): Unless = If ... not.
• Công thức biến đổi viết lại câu: If + S + don''t/doesn''t + V, Mệnh đề chính <=> Unless + S + V(khẳng định - nhớ chia s/es nếu chủ ngữ số ít!), Mệnh đề chính giữ nguyên!', 'Bẫy đề thi số 1: TUYỆT ĐỐI KHÔNG dùng ''will / won''t'' ngay trong mệnh đề chứa ''If'' hoặc ''Unless''! (Ví dụ: If it will rain -> SAI, phải là If it rains).
Bẫy đề thi số 2 (Viết lại câu với Unless): Khi đổi ''If she doesn''t practice...'' sang ''Unless'', bỏ ''doesn''t'' thì phải nhớ thêm ''-s/-es'' vào động từ: ''Unless she practices...''!
Bẫy đề thi số 3 (Đổi từ câu mệnh lệnh nối bằng OR sang If): ''Hurry up, or you will be late'' => ''If you don''t hurry up, you will be late'' (hoặc ''Unless you hurry up, you will be late'').', 2)
ON CONFLICT (id) DO UPDATE SET topic_title = EXCLUDED.topic_title, explanation = EXCLUDED.explanation, formula = EXCLUDED.formula, exam_traps = EXCLUDED.exam_traps;

-- EXERCISE (PRACTICE QUIZ) FOR UNIT-6
INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('quiz-unit-6', 'course-eng-8-gs', 'unit-6', 'unit-6-lesson-quiz', 'Bài tập củng cố Lifestyles', 'unit_quiz', 'Luyện tập', 15, 'Kiến thức Lifestyles', '12 câu trắc nghiệm kiểm tra từ vựng, ngữ pháp và phát âm')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q1', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'Choose the word that has the /pr/ sound: A. bridge   B. broccoli   C. improve   D. celebrate', '''improve'' (/ɪmˈpruːv/) chứa âm /pr/. Các từ bridge, broccoli, celebrate chứa âm /br/.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q1_opt_0', 'u6-q1', 0, 'A. bridge', FALSE),
('u6-q1_opt_1', 'u6-q1', 1, 'B. broccoli', FALSE),
('u6-q1_opt_2', 'u6-q1', 2, 'C. improve', TRUE),
('u6-q1_opt_3', 'u6-q1', 3, 'D. celebrate', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q2', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'If we _______ online classes tomorrow, we won''t have to travel to school in the rain.', 'Câu điều kiện loại 1: Trong mệnh đề ''If'' chia thì Hiện tại đơn (mặc dù có chữ ''tomorrow''!). Chủ ngữ ''we'' -> dùng ''have''.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q2_opt_0', 'u6-q2', 0, 'A. will have', FALSE),
('u6-q2_opt_1', 'u6-q2', 1, 'B. have', TRUE),
('u6-q2_opt_2', 'u6-q2', 2, 'C. had', FALSE),
('u6-q2_opt_3', 'u6-q2', 3, 'D. are having', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q3', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'If Minh _______ his homework tonight, his mother won''t let him play computer games.', 'Mệnh đề ''If'' trong câu điều kiện loại 1 chia Hiện tại đơn. Chủ ngữ ''Minh'' là số ít -> dùng ''doesn''t finish''.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q3_opt_0', 'u6-q3', 0, 'A. won''t finish', FALSE),
('u6-q3_opt_1', 'u6-q3', 1, 'B. don''t finish', FALSE),
('u6-q3_opt_2', 'u6-q3', 2, 'C. doesn''t finish', TRUE),
('u6-q3_opt_3', 'u6-q3', 3, 'D. didn''t finish', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q4', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'Unless she _______ early tomorrow morning, she will miss the first train to Sa Pa.', 'Sau ''Unless'' (= If ... not) ta dùng mệnh đề khẳng định ở thì Hiện tại đơn. Chủ ngữ ''she'' số ít -> ''leaves''.', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q4_opt_0', 'u6-q4', 0, 'A. leaves', TRUE),
('u6-q4_opt_1', 'u6-q4', 1, 'B. doesn''t leave', FALSE),
('u6-q4_opt_2', 'u6-q4', 2, 'C. will leave', FALSE),
('u6-q4_opt_3', 'u6-q4', 3, 'D. leave', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q5', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'My grandmother is in the _______ of waking up at 5 a.m. to do morning exercise.', 'Cụm từ cố định: ''be in the habit of + V-ing'' (có thói quen làm gì).', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q5_opt_0', 'u6-q5', 0, 'A. custom', FALSE),
('u6-q5_opt_1', 'u6-q5', 1, 'B. tradition', FALSE),
('u6-q5_opt_2', 'u6-q5', 2, 'C. habit', TRUE),
('u6-q5_opt_3', 'u6-q5', 3, 'D. lifestyle', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q6', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'Sorry, I can''t talk right now because I am in a _______ to catch the bus!', 'Cụm từ cố định: ''in a hurry'' (đang vội vàng).', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q6_opt_0', 'u6-q6', 0, 'A. habit', FALSE),
('u6-q6_opt_1', 'u6-q6', 1, 'B. hurry', TRUE),
('u6-q6_opt_2', 'u6-q6', 2, 'C. lifestyle', FALSE),
('u6-q6_opt_3', 'u6-q6', 3, 'D. greeting', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q7', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'In Japan, people usually _______ to greet each other instead of shaking hands.', '''bow'': cúi đầu chào (phong cách chào hỏi đặc trưng của người Nhật).', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q7_opt_0', 'u6-q7', 0, 'A. hug', FALSE),
('u6-q7_opt_1', 'u6-q7', 1, 'B. bow', TRUE),
('u6-q7_opt_2', 'u6-q7', 2, 'C. weave', FALSE),
('u6-q7_opt_3', 'u6-q7', 3, 'D. maintain', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q8', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'Modern technology has a strong _______ on the way teenagers communicate today.', 'Cụm từ ''have a strong impact on sth'': có tác động/ảnh hưởng mạnh mẽ lên cái gì.', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q8_opt_0', 'u6-q8', 0, 'A. impact', TRUE),
('u6-q8_opt_1', 'u6-q8', 1, 'B. habit', FALSE),
('u6-q8_opt_2', 'u6-q8', 2, 'C. hurry', FALSE),
('u6-q8_opt_3', 'u6-q8', 3, 'D. dogsled', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q9', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'I think people _______ more interactive devices for learning in the next 10 years.', '''I think ... in the next 10 years'' diễn tả dự đoán trong tương lai -> dùng thì Tương lai đơn ''will use''.', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q9_opt_0', 'u6-q9', 0, 'A. use', FALSE),
('u6-q9_opt_1', 'u6-q9', 1, 'B. used', FALSE),
('u6-q9_opt_2', 'u6-q9', 2, 'C. will use', TRUE),
('u6-q9_opt_3', 'u6-q9', 3, 'D. are using', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q10', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'Even though many young people move to cities, the villagers still _______ their traditional craft of weaving.', '''maintain'': duy trì, giữ gìn (nghề dệt truyền thống).', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q10_opt_0', 'u6-q10', 0, 'A. maintain', TRUE),
('u6-q10_opt_1', 'u6-q10', 1, 'B. greet', FALSE),
('u6-q10_opt_2', 'u6-q10', 2, 'C. interact', FALSE),
('u6-q10_opt_3', 'u6-q10', 3, 'D. hurry', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q11', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'Rewrite check: ''Study hard, or you won''t pass the final exam.'' means _______.', '''Hãy học chăm chỉ, nếu không bạn sẽ không đỗ kì thi'' = ''Nếu bạn không học chăm chỉ (If you don''t study hard), bạn sẽ không đỗ kì thi''.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q11_opt_0', 'u6-q11', 0, 'A. If you study hard, you won''t pass the final exam.', FALSE),
('u6-q11_opt_1', 'u6-q11', 1, 'B. If you don''t study hard, you won''t pass the final exam.', TRUE),
('u6-q11_opt_2', 'u6-q11', 2, 'C. Unless you don''t study hard, you won''t pass the final exam.', FALSE),
('u6-q11_opt_3', 'u6-q11', 3, 'D. If you won''t study hard, you don''t pass the final exam.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('u6-q12', 'quiz-unit-6', 'Trắc nghiệm củng cố', 'Find the mistake: If the weather <u>will be</u> fine this weekend, our family <u>will go</u> camping <u>by</u> the <u>lake</u>.', 'Trong mệnh đề ''If'' của câu điều kiện loại 1 không dùng ''will be'', phải chia Hiện tại đơn -> sửa ''will be'' thành ''is''.', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('u6-q12_opt_0', 'u6-q12', 0, 'A. will be', TRUE),
('u6-q12_opt_1', 'u6-q12', 1, 'B. will go', FALSE),
('u6-q12_opt_2', 'u6-q12', 2, 'C. by', FALSE),
('u6-q12_opt_3', 'u6-q12', 3, 'D. lake', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

-- ==============================================================================
-- 7. EXAMS (15 PHÚT, GIỮA KÌ 1, CUỐI KÌ 1)
-- ==============================================================================
INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('exam-15m-1', 'course-eng-8-gs', NULL, NULL, 'Đề kiểm tra 15 phút số 1 (Unit 1 & Unit 2)', '15m', '15 Phút', 15, 'Unit 1 (Leisure Time) & Unit 2 (Life in the Countryside)', 'Ôn tập âm /ʊ/ - /uː/, /ə/ - /ɪ/, động từ chỉ sự yêu thích (V-ing/to V) và so sánh hơn của trạng từ.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q1', 'exam-15m-1', 'I. Pronunciation (Ngữ âm)', 'Choose the word whose underlined part is pronounced differently: A. p<u>u</u>dding   B. p<u>u</u>t   C. s<u>u</u>gar   D. J<u>u</u>ne', '''June'' phát âm là /dʒuːn/ (âm /uː/ dài). Các từ pudding, put, sugar đều phát âm là /ʊ/ ngắn.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q1_opt_0', 'e15_1_q1', 0, 'A. pudding', FALSE),
('e15_1_q1_opt_1', 'e15_1_q1', 1, 'B. put', FALSE),
('e15_1_q1_opt_2', 'e15_1_q1', 2, 'C. sugar', FALSE),
('e15_1_q1_opt_3', 'e15_1_q1', 3, 'D. June', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q2', 'exam-15m-1', 'I. Pronunciation (Ngữ âm)', 'Choose the word whose underlined part is pronounced differently: A. c<u>oo</u>l   B. f<u>oo</u>d   C. g<u>oo</u>d   D. sp<u>oo</u>n', '''good'' phát âm là /ɡʊd/ (âm /ʊ/ ngắn). Các từ cool, food, spoon phát âm là /uː/ dài.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q2_opt_0', 'e15_1_q2', 0, 'A. cool', FALSE),
('e15_1_q2_opt_1', 'e15_1_q2', 1, 'B. food', FALSE),
('e15_1_q2_opt_2', 'e15_1_q2', 2, 'C. good', TRUE),
('e15_1_q2_opt_3', 'e15_1_q2', 3, 'D. spoon', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q3', 'exam-15m-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'My cousin adores _______ photos of picturesque landscapes in the countryside.', 'Sau động từ ''adore'' (yêu thích, mê mẩn) bắt buộc dùng V-ing -> taking.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q3_opt_0', 'e15_1_q3', 0, 'A. take', FALSE),
('e15_1_q3_opt_1', 'e15_1_q3', 1, 'B. taking', TRUE),
('e15_1_q3_opt_2', 'e15_1_q3', 2, 'C. to take', FALSE),
('e15_1_q3_opt_3', 'e15_1_q3', 3, 'D. took', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q4', 'exam-15m-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Do you mind _______ me load these rice bags onto the truck?', 'Cấu trúc ''Do/Would you mind + V-ing?'' -> helping.', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q4_opt_0', 'e15_1_q4', 0, 'A. helping', TRUE),
('e15_1_q4_opt_1', 'e15_1_q4', 1, 'B. to help', FALSE),
('e15_1_q4_opt_2', 'e15_1_q4', 2, 'C. help', FALSE),
('e15_1_q4_opt_3', 'e15_1_q4', 3, 'D. helped', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q5', 'exam-15m-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Are you fond _______ making origami in your leisure time?', 'Cụm tính từ cố định: ''be fond of + V-ing'' (thích làm gì).', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q5_opt_0', 'e15_1_q5', 0, 'A. on', FALSE),
('e15_1_q5_opt_1', 'e15_1_q5', 1, 'B. in', FALSE),
('e15_1_q5_opt_2', 'e15_1_q5', 2, 'C. about', FALSE),
('e15_1_q5_opt_3', 'e15_1_q5', 3, 'D. of', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q6', 'exam-15m-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'A combine harvester can cut and thresh grain much _______ than traditional methods.', '''fast'' vừa là tính từ vừa là trạng từ ngắn -> dạng so sánh hơn là ''faster'' (không có từ fastly).', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q6_opt_0', 'e15_1_q6', 0, 'A. faster', TRUE),
('e15_1_q6_opt_1', 'e15_1_q6', 1, 'B. more fastly', FALSE),
('e15_1_q6_opt_2', 'e15_1_q6', 2, 'C. fastlier', FALSE),
('e15_1_q6_opt_3', 'e15_1_q6', 3, 'D. more fast', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q7', 'exam-15m-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'People in rural areas often greet guests _______ than people in crowded cities.', 'Bổ nghĩa cho động từ thường ''greet'' cần dùng trạng từ ''hospitably''. So sánh hơn: ''more hospitably''.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q7_opt_0', 'e15_1_q7', 0, 'A. more hospitable', FALSE),
('e15_1_q7_opt_1', 'e15_1_q7', 1, 'B. hospitabler', FALSE),
('e15_1_q7_opt_2', 'e15_1_q7', 2, 'C. more hospitably', TRUE),
('e15_1_q7_opt_3', 'e15_1_q7', 3, 'D. hospitably', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q8', 'exam-15m-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'In the afternoon, village boys often _______ buffaloes on the green pasture.', '''herd buffaloes'': chăn trâu.', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q8_opt_0', 'e15_1_q8', 0, 'A. plough', FALSE),
('e15_1_q8_opt_1', 'e15_1_q8', 1, 'B. herd', TRUE),
('e15_1_q8_opt_2', 'e15_1_q8', 2, 'C. milk', FALSE),
('e15_1_q8_opt_3', 'e15_1_q8', 3, 'D. dry', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q9', 'exam-15m-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'My sister bought a knitting _______ yesterday because she wants to make a scarf.', '''knitting kit'': bộ dụng cụ đan len.', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q9_opt_0', 'e15_1_q9', 0, 'A. tool', FALSE),
('e15_1_q9_opt_1', 'e15_1_q9', 1, 'B. kit', TRUE),
('e15_1_q9_opt_2', 'e15_1_q9', 2, 'C. net', FALSE),
('e15_1_q9_opt_3', 'e15_1_q9', 3, 'D. puzzle', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q10', 'exam-15m-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'He drove _______ after the accident, so everyone felt safer.', 'Bổ nghĩa cho động từ ''drove'' và hợp nghĩa ''mọi người cảm thấy an toàn hơn'' -> ''more carefully'' (cẩn thận hơn).', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q10_opt_0', 'e15_1_q10', 0, 'A. more careful', FALSE),
('e15_1_q10_opt_1', 'e15_1_q10', 1, 'B. carefuller', FALSE),
('e15_1_q10_opt_2', 'e15_1_q10', 2, 'C. more carefully', TRUE),
('e15_1_q10_opt_3', 'e15_1_q10', 3, 'D. less carefully', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q11', 'exam-15m-1', 'III. Error Identification (Tìm lỗi sai)', 'Find the mistake: She <u>would like</u> <u>visiting</u> her grandparents in the <u>countryside</u> this <u>summer</u>.', 'Sau ''would like'' bắt buộc dùng ''to + V nguyên thể'' -> sửa ''visiting'' thành ''to visit''.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q11_opt_0', 'e15_1_q11', 0, 'A. would like', FALSE),
('e15_1_q11_opt_1', 'e15_1_q11', 1, 'B. visiting', TRUE),
('e15_1_q11_opt_2', 'e15_1_q11', 2, 'C. countryside', FALSE),
('e15_1_q11_opt_3', 'e15_1_q11', 3, 'D. summer', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_1_q12', 'exam-15m-1', 'IV. Sentence Transformation (Viết lại câu)', 'Choose the sentence that is closest in meaning: ''I like reading comic books more than playing video games.''', 'like A more than B = prefer + V-ing (A) + TO + V-ing (B) (thích làm A hơn làm B).', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_1_q12_opt_0', 'e15_1_q12', 0, 'A. I prefer reading comic books to playing video games.', TRUE),
('e15_1_q12_opt_1', 'e15_1_q12', 1, 'B. I prefer to read comic books than play video games.', FALSE),
('e15_1_q12_opt_2', 'e15_1_q12', 2, 'C. I prefer playing video games to reading comic books.', FALSE),
('e15_1_q12_opt_3', 'e15_1_q12', 3, 'D. I detest reading comic books and playing video games.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('exam-15m-2', 'course-eng-8-gs', NULL, NULL, 'Đề kiểm tra 15 phút số 2 (Unit 3 & Unit 4)', '15m', '15 Phút', 15, 'Unit 3 (Teenagers) & Unit 4 (Ethnic Groups of Viet Nam)', 'Ôn tập Câu đơn - Câu ghép (FANBOYS, however, therefore, otherwise), Câu hỏi Wh- và Danh từ đếm được / không đếm được.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q1', 'exam-15m-2', 'I. Pronunciation (Ngữ âm)', 'Choose the word whose underlined part is pronounced differently: A. av<u>oi</u>d   B. n<u>oi</u>sy   C. t<u>ou</u>rnament   D. j<u>oi</u>n', '''tournament'' (/ˈtʊənəmənt/) chứa âm /ʊə/. Các từ avoid, noisy, join chứa âm /ɔɪ/.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q1_opt_0', 'e15_2_q1', 0, 'A. avoid', FALSE),
('e15_2_q1_opt_1', 'e15_2_q1', 1, 'B. noisy', FALSE),
('e15_2_q1_opt_2', 'e15_2_q1', 2, 'C. tournament', TRUE),
('e15_2_q1_opt_3', 'e15_2_q1', 3, 'D. join', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q2', 'exam-15m-2', 'I. Pronunciation (Ngữ âm)', 'Choose the word whose underlined part is pronounced differently: A. <u>k</u>itchen   B. fol<u>k</u>   C. <u>k</u>nit   D. <u>c</u>ostume', 'Chữ ''k'' trong ''knit'' (/nɪt/) là âm câm (không phát âm). Các từ còn lại đều phát âm là /k/.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q2_opt_0', 'e15_2_q2', 0, 'A. kitchen', FALSE),
('e15_2_q2_opt_1', 'e15_2_q2', 1, 'B. folk', FALSE),
('e15_2_q2_opt_2', 'e15_2_q2', 2, 'C. knit', TRUE),
('e15_2_q2_opt_3', 'e15_2_q2', 3, 'D. costume', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q3', 'exam-15m-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Lan wanted to join the school arts club; _______, her parents wanted her to join the chess club.', 'Có dấu `; _______ ,` và hai vế đối lập nghĩa -> chọn trạng từ liên kết ''however''.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q3_opt_0', 'e15_2_q3', 0, 'A. but', FALSE),
('e15_2_q3_opt_1', 'e15_2_q3', 1, 'B. however', TRUE),
('e15_2_q3_opt_2', 'e15_2_q3', 2, 'C. therefore', FALSE),
('e15_2_q3_opt_3', 'e15_2_q3', 3, 'D. so', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q4', 'exam-15m-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'You must wear warm clothes when travelling to Sa Pa in winter, _______ you will catch a cold.', 'Trước chỗ trống chỉ có dấu phẩy (,) và sau chỗ trống KHÔNG có dấu phẩy -> chọn liên từ ''or'' (nếu không thì).', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q4_opt_0', 'e15_2_q4', 0, 'A. otherwise', FALSE),
('e15_2_q4_opt_1', 'e15_2_q4', 1, 'B. or', TRUE),
('e15_2_q4_opt_2', 'e15_2_q4', 2, 'C. therefore', FALSE),
('e15_2_q4_opt_3', 'e15_2_q4', 3, 'D. however', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q5', 'exam-15m-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'How _______ terraced fields did you see on your trip to Mu Cang Chai?', '''terraced fields'' là danh từ đếm được số nhiều -> dùng ''How many''.', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q5_opt_0', 'e15_2_q5', 0, 'A. much', FALSE),
('e15_2_q5_opt_1', 'e15_2_q5', 1, 'B. many', TRUE),
('e15_2_q5_opt_2', 'e15_2_q5', 2, 'C. a little', FALSE),
('e15_2_q5_opt_3', 'e15_2_q5', 3, 'D. little', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q6', 'exam-15m-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'The teacher gave us _______ useful advice on how to deal with exam stress.', '''advice'' (lời khuyên) là danh từ KHÔNG đếm được -> không dùng a, an, many; dùng ''some''.', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q6_opt_0', 'e15_2_q6', 0, 'A. a', FALSE),
('e15_2_q6_opt_1', 'e15_2_q6', 1, 'B. an', FALSE),
('e15_2_q6_opt_2', 'e15_2_q6', 2, 'C. many', FALSE),
('e15_2_q6_opt_3', 'e15_2_q6', 3, 'D. some', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q7', 'exam-15m-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', '_______ do ethnic minority people often hold their village festivals? — In spring.', 'Câu trả lời là ''In spring'' (vào mùa xuân - chỉ thời gian) -> dùng ''When''.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q7_opt_0', 'e15_2_q7', 0, 'A. Where', FALSE),
('e15_2_q7_opt_1', 'e15_2_q7', 1, 'B. When', TRUE),
('e15_2_q7_opt_2', 'e15_2_q7', 2, 'C. How', FALSE),
('e15_2_q7_opt_3', 'e15_2_q7', 3, 'D. Why', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q8', 'exam-15m-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'In a traditional stilt house, the space under the house is often used to keep _______.', '''livestock'': gia súc, vật nuôi (thường được nuôi/nhốt dưới gầm sàn hoặc chuồng cạnh nhà sàn).', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q8_opt_0', 'e15_2_q8', 0, 'A. livestock', TRUE),
('e15_2_q8_opt_1', 'e15_2_q8', 1, 'B. forums', FALSE),
('e15_2_q8_opt_2', 'e15_2_q8', 2, 'C. notifications', FALSE),
('e15_2_q8_opt_3', 'e15_2_q8', 3, 'D. staircases', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q9', 'exam-15m-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Teenagers shouldn''t check social media _______ while studying because it distracts them.', '''check notifications'': kiểm tra thông báo mạng xã hội.', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q9_opt_0', 'e15_2_q9', 0, 'A. expectations', FALSE),
('e15_2_q9_opt_1', 'e15_2_q9', 1, 'B. notifications', TRUE),
('e15_2_q9_opt_2', 'e15_2_q9', 2, 'C. tournaments', FALSE),
('e15_2_q9_opt_3', 'e15_2_q9', 3, 'D. costumes', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q10', 'exam-15m-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', '_______ is the most important musical instrument of the ethnic groups in the Central Highlands?', 'Hỏi ''Nhạc cụ quan trọng nhất ... là gì?'' -> dùng ''What''.', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q10_opt_0', 'e15_2_q10', 0, 'A. What', TRUE),
('e15_2_q10_opt_1', 'e15_2_q10', 1, 'B. Who', FALSE),
('e15_2_q10_opt_2', 'e15_2_q10', 2, 'C. Where', FALSE),
('e15_2_q10_opt_3', 'e15_2_q10', 3, 'D. How many', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q11', 'exam-15m-2', 'III. Error Identification (Tìm lỗi sai)', 'Find the mistake: There <u>aren''t</u> <u>much</u> ethnic minority <u>students</u> in my <u>school</u>.', '''students'' là danh từ đếm được số nhiều -> sửa ''much'' thành ''many''.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q11_opt_0', 'e15_2_q11', 0, 'A. aren''t', FALSE),
('e15_2_q11_opt_1', 'e15_2_q11', 1, 'B. much', TRUE),
('e15_2_q11_opt_2', 'e15_2_q11', 2, 'C. students', FALSE),
('e15_2_q11_opt_3', 'e15_2_q11', 3, 'D. school', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_2_q12', 'exam-15m-2', 'IV. Sentence Transformation (Viết lại câu)', 'Combine the sentences: ''The Rong house is very tall. It is the heart of the village.''', 'Hai ý bổ sung thông tin tích cực cho nhau -> nối bằng '', and''.', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_2_q12_opt_0', 'e15_2_q12', 0, 'A. The Rong house is very tall, and it is the heart of the village.', TRUE),
('e15_2_q12_opt_1', 'e15_2_q12', 1, 'B. The Rong house is very tall, but it is the heart of the village.', FALSE),
('e15_2_q12_opt_2', 'e15_2_q12', 2, 'C. The Rong house is very tall; otherwise, it is the heart of the village.', FALSE),
('e15_2_q12_opt_3', 'e15_2_q12', 3, 'D. The Rong house is very tall, or it is the heart of the village.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('exam-15m-3', 'course-eng-8-gs', NULL, NULL, 'Đề kiểm tra 15 phút số 3 (Unit 5 & Unit 6)', '15m', '15 Phút', 15, 'Unit 5 (Our Customs and Traditions) & Unit 6 (Lifestyles)', 'Ôn tập Mạo từ (a, an, the, Ø), Tương lai đơn (will) và Câu điều kiện loại 1 (If / Unless).')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q1', 'exam-15m-3', 'I. Pronunciation (Ngữ âm)', 'Choose the word whose underlined part is pronounced differently: A. s<u>i</u>ngle   B. la<u>n</u>tern   C. a<u>n</u>gry   D. u<u>n</u>cle', 'Trong ''lantern'' (/ˈlæntən/), chữ ''n'' đứng trước âm /t/ nên đọc là /n/. Trong single, angry, uncle chữ ''n'' đứng trước /ɡ/, /k/ nên đọc là /ŋ/.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q1_opt_0', 'e15_3_q1', 0, 'A. single', FALSE),
('e15_3_q1_opt_1', 'e15_3_q1', 1, 'B. lantern', TRUE),
('e15_3_q1_opt_2', 'e15_3_q1', 2, 'C. angry', FALSE),
('e15_3_q1_opt_3', 'e15_3_q1', 3, 'D. uncle', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q2', 'exam-15m-3', 'I. Pronunciation (Ngữ âm)', 'Choose the word that has the /br/ sound: A. apricot   B. precious   C. bracelet   D. prepare', '''bracelet'' (/ˈbreɪslət/ - vòng tay) chứa âm /br/. Các từ còn lại chứa âm /pr/.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q2_opt_0', 'e15_3_q2', 0, 'A. apricot', FALSE),
('e15_3_q2_opt_1', 'e15_3_q2', 1, 'B. precious', FALSE),
('e15_3_q2_opt_2', 'e15_3_q2', 2, 'C. bracelet', TRUE),
('e15_3_q2_opt_3', 'e15_3_q2', 3, 'D. prepare', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q3', 'exam-15m-3', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Vietnamese people often visit pagodas on _______ first day of the Lunar New Year.', 'Trước số thứ tự (first, second, third...) bắt buộc dùng mạo từ ''the'' (the first day).', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q3_opt_0', 'e15_3_q3', 0, 'A. a', FALSE),
('e15_3_q3_opt_1', 'e15_3_q3', 1, 'B. an', FALSE),
('e15_3_q3_opt_2', 'e15_3_q3', 2, 'C. the', TRUE),
('e15_3_q3_opt_3', 'e15_3_q3', 3, 'D. Ø', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q4', 'exam-15m-3', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'At _______ Tet, children are excited to receive lucky money in red envelopes.', 'Cụm cố định: ''at Tet'' (KHÔNG dùng mạo từ trước Tet).', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q4_opt_0', 'e15_3_q4', 0, 'A. a', FALSE),
('e15_3_q4_opt_1', 'e15_3_q4', 1, 'B. an', FALSE),
('e15_3_q4_opt_2', 'e15_3_q4', 2, 'C. the', FALSE),
('e15_3_q4_opt_3', 'e15_3_q4', 3, 'D. Ø (no article)', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q5', 'exam-15m-3', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'My brother is studying at _______ university in Ha Noi.', '''university'' phát âm bắt đầu bằng phụ âm /j/ (/ˌjuːnɪˈvɜːsəti/) -> dùng mạo từ ''a'' (không dùng ''an'').', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q5_opt_0', 'e15_3_q5', 0, 'A. a', TRUE),
('e15_3_q5_opt_1', 'e15_3_q5', 1, 'B. an', FALSE),
('e15_3_q5_opt_2', 'e15_3_q5', 2, 'C. the', FALSE),
('e15_3_q5_opt_3', 'e15_3_q5', 3, 'D. Ø', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q6', 'exam-15m-3', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'If tourists _______ a Cham village, they will have a chance to see traditional pottery making.', 'Mệnh đề ''If'' trong câu điều kiện loại 1 dùng thì Hiện tại đơn -> ''visit''.', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q6_opt_0', 'e15_3_q6', 0, 'A. will visit', FALSE),
('e15_3_q6_opt_1', 'e15_3_q6', 1, 'B. visit', TRUE),
('e15_3_q6_opt_2', 'e15_3_q6', 2, 'C. visited', FALSE),
('e15_3_q6_opt_3', 'e15_3_q6', 3, 'D. visiting', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q7', 'exam-15m-3', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Unless we _______ our traditional customs, young generations will forget them.', 'Unless = If ... not -> theo sau Unless là mệnh đề khẳng định ở Hiện tại đơn -> ''maintain''.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q7_opt_0', 'e15_3_q7', 0, 'A. don''t maintain', FALSE),
('e15_3_q7_opt_1', 'e15_3_q7', 1, 'B. will maintain', FALSE),
('e15_3_q7_opt_2', 'e15_3_q7', 2, 'C. maintain', TRUE),
('e15_3_q7_opt_3', 'e15_3_q7', 3, 'D. maintained', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q8', 'exam-15m-3', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'In Viet Nam, it is good _______ manners to wait for the eldest person to sit down first.', 'Cụm danh từ cố định: ''table manners'' (phép tắc trên bàn ăn).', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q8_opt_0', 'e15_3_q8', 0, 'A. chair', FALSE),
('e15_3_q8_opt_1', 'e15_3_q8', 1, 'B. meal', FALSE),
('e15_3_q8_opt_2', 'e15_3_q8', 2, 'C. table', TRUE),
('e15_3_q8_opt_3', 'e15_3_q8', 3, 'D. food', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q9', 'exam-15m-3', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'In Alaska, a _______ drives a dogsled across the snow.', '''musher'': người điều khiển xe trượt tuyết chó kéo (dogsled).', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q9_opt_0', 'e15_3_q9', 0, 'A. festival goer', FALSE),
('e15_3_q9_opt_1', 'e15_3_q9', 1, 'B. musher', TRUE),
('e15_3_q9_opt_2', 'e15_3_q9', 2, 'C. monk', FALSE),
('e15_3_q9_opt_3', 'e15_3_q9', 3, 'D. nomad', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q10', 'exam-15m-3', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Are you in the habit _______ eating street food after school?', 'Cụm từ cố định: ''be in the habit of + V-ing'' (có thói quen làm gì).', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q10_opt_0', 'e15_3_q10', 0, 'A. on', FALSE),
('e15_3_q10_opt_1', 'e15_3_q10', 1, 'B. at', FALSE),
('e15_3_q10_opt_2', 'e15_3_q10', 2, 'C. of', TRUE),
('e15_3_q10_opt_3', 'e15_3_q10', 3, 'D. with', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q11', 'exam-15m-3', 'III. Error Identification (Tìm lỗi sai)', 'Find the mistake: Unless she <u>doesn''t hurry</u>, she <u>will</u> be late <u>for</u> the opening <u>ceremony</u>.', 'Bản thân ''Unless'' đã mang nghĩa phủ định (Nếu... không), nên không dùng ''doesn''t hurry'' sau Unless -> phải sửa thành ''hurries''.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q11_opt_0', 'e15_3_q11', 0, 'A. doesn''t hurry', TRUE),
('e15_3_q11_opt_1', 'e15_3_q11', 1, 'B. will', FALSE),
('e15_3_q11_opt_2', 'e15_3_q11', 2, 'C. for', FALSE),
('e15_3_q11_opt_3', 'e15_3_q11', 3, 'D. ceremony', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('e15_3_q12', 'exam-15m-3', 'IV. Sentence Transformation (Viết lại câu)', 'Rewrite: ''If you don''t wear a coat, you will feel cold.''', '''If you don''t wear a coat'' = ''Unless you wear a coat'', vế sau giữ nguyên ''you will feel cold''.', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('e15_3_q12_opt_0', 'e15_3_q12', 0, 'A. Unless you wear a coat, you will feel cold.', TRUE),
('e15_3_q12_opt_1', 'e15_3_q12', 1, 'B. Unless you don''t wear a coat, you will feel cold.', FALSE),
('e15_3_q12_opt_2', 'e15_3_q12', 2, 'C. If you wear a coat, you will feel cold.', FALSE),
('e15_3_q12_opt_3', 'e15_3_q12', 3, 'D. Unless you wear a coat, you won''t feel cold.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('exam-midterm-1', 'course-eng-8-gs', NULL, NULL, 'Đề thi Giữa Học kì 1 (Chuẩn cấu trúc - Unit 1, 2, 3)', 'midterm', 'Giữa Kì 1', 45, 'Toàn bộ kiến thức Unit 1, Unit 2, Unit 3', 'Đề gồm 25 câu trắc nghiệm tổng hợp đầy đủ các phần: Ngữ âm, Trọng âm, Từ vựng - Ngữ pháp, Tình huống giao tiếp, Tìm lỗi sai, Đọc hiểu và Viết lại câu.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q1', 'exam-midterm-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word whose underlined part is pronounced differently: A. w<u>o</u>man   B. w<u>o</u>lf   C. m<u>o</u>ve   D. c<u>oo</u>k', '''move'' phát âm là /muːv/ (âm /uː/ dài). Các từ woman (/ˈwʊmən/), wolf (/wʊlf/), cook (/kʊk/) đều phát âm là /ʊ/ ngắn.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q1_opt_0', 'mid1_q1', 0, 'A. woman', FALSE),
('mid1_q1_opt_1', 'mid1_q1', 1, 'B. wolf', FALSE),
('mid1_q1_opt_2', 'mid1_q1', 2, 'C. move', TRUE),
('mid1_q1_opt_3', 'mid1_q1', 3, 'D. cook', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q2', 'exam-midterm-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word whose underlined part is pronounced differently: A. p<u>oo</u>r   B. s<u>u</u>re   C. t<u>ou</u>rist   D. v<u>oi</u>ce', '''voice'' (/vɔɪs/) chứa nguyên âm đôi /ɔɪ/. Các từ poor, sure, tourist chứa nguyên âm đôi /ʊə/.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q2_opt_0', 'mid1_q2', 0, 'A. poor', FALSE),
('mid1_q2_opt_1', 'mid1_q2', 1, 'B. sure', FALSE),
('mid1_q2_opt_2', 'mid1_q2', 2, 'C. tourist', FALSE),
('mid1_q2_opt_3', 'mid1_q2', 3, 'D. voice', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q3', 'exam-midterm-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word that has a different stress pattern (trọng âm): A. leisure   B. detest   C. harvest   D. orchard', '''detest'' (/dɪˈtest/) là động từ 2 âm tiết có trọng âm rơi vào âm tiết thứ 2. Các từ leisure, harvest, orchard là danh từ 2 âm tiết có trọng âm rơi vào âm 1.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q3_opt_0', 'mid1_q3', 0, 'A. leisure', FALSE),
('mid1_q3_opt_1', 'mid1_q3', 1, 'B. detest', TRUE),
('mid1_q3_opt_2', 'mid1_q3', 2, 'C. harvest', FALSE),
('mid1_q3_opt_3', 'mid1_q3', 3, 'D. orchard', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q4', 'exam-midterm-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word that has a different stress pattern (trọng âm): A. hospitable   B. picturesque   C. teenager   D. cultivate', '''picturesque'' (/ˌpɪktʃəˈresk/) có trọng âm rơi vào âm tiết thứ 3 (đuôi -esque nhận trọng âm).', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q4_opt_0', 'mid1_q4', 0, 'A. hospitable', FALSE),
('mid1_q4_opt_1', 'mid1_q4', 1, 'B. picturesque', TRUE),
('mid1_q4_opt_2', 'mid1_q4', 2, 'C. teenager', FALSE),
('mid1_q4_opt_3', 'mid1_q4', 3, 'D. cultivate', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q5', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'My best friend fancies _______ puzzles in her free time because it trains her mind.', 'Kết hợp 2 kiến thức: ''do puzzles'' (giải câu đố) + sau ''fancy'' dùng V-ing -> ''doing''.', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q5_opt_0', 'mid1_q5', 0, 'A. doing', TRUE),
('mid1_q5_opt_1', 'mid1_q5', 1, 'B. making', FALSE),
('mid1_q5_opt_2', 'mid1_q5', 2, 'C. to do', FALSE),
('mid1_q5_opt_3', 'mid1_q5', 3, 'D. to make', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q6', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Teenagers today are very keen _______ using social media to connect with friends.', 'Cụm từ cố định: ''be keen on + V-ing''.', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q6_opt_0', 'mid1_q6', 0, 'A. in', FALSE),
('mid1_q6_opt_1', 'mid1_q6', 1, 'B. of', FALSE),
('mid1_q6_opt_2', 'mid1_q6', 2, 'C. about', FALSE),
('mid1_q6_opt_3', 'mid1_q6', 3, 'D. on', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q7', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Life in the countryside is much _______ than life in the city, and people live _______.', 'Vế 1 sau động từ ''is'' cần tính từ so sánh hơn -> ''quieter''. Vế 2 sau động từ thường ''live'' cần trạng từ so sánh hơn -> ''more peacefully''.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q7_opt_0', 'mid1_q7', 0, 'A. quieter / more peacefully', TRUE),
('mid1_q7_opt_1', 'mid1_q7', 1, 'B. more quietly / more peaceful', FALSE),
('mid1_q7_opt_2', 'mid1_q7', 2, 'C. quieter / peacefuller', FALSE),
('mid1_q7_opt_3', 'mid1_q7', 3, 'D. more quiet / more peaceful', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q8', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Can you speak a bit _______, please? I can''t catch what you are saying.', 'Bổ nghĩa cho động từ ''speak'' -> dùng trạng từ so sánh hơn ''more slowly'' (chậm hơn một chút).', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q8_opt_0', 'mid1_q8', 0, 'A. slowlier', FALSE),
('mid1_q8_opt_1', 'mid1_q8', 1, 'B. more slow', FALSE),
('mid1_q8_opt_2', 'mid1_q8', 2, 'C. more slowly', TRUE),
('mid1_q8_opt_3', 'mid1_q8', 3, 'D. slower', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q9', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Minh studied very hard for the exam; _______, he got the highest mark in his class.', 'Giữa dấu chấm phẩy (;) và dấu phẩy (,) dùng trạng từ liên kết; chỉ kết quả hợp lý -> ''therefore'' (do đó).', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q9_opt_0', 'mid1_q9', 0, 'A. however', FALSE),
('mid1_q9_opt_1', 'mid1_q9', 1, 'B. therefore', TRUE),
('mid1_q9_opt_2', 'mid1_q9', 2, 'C. otherwise', FALSE),
('mid1_q9_opt_3', 'mid1_q9', 3, 'D. so', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q10', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'You should log _______ to the school forum to read the club leader''s announcement.', '''log on to'': đăng nhập vào.', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q10_opt_0', 'mid1_q10', 0, 'A. at', FALSE),
('mid1_q10_opt_1', 'mid1_q10', 1, 'B. on', TRUE),
('mid1_q10_opt_2', 'mid1_q10', 2, 'C. with', FALSE),
('mid1_q10_opt_3', 'mid1_q10', 3, 'D. of', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q11', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'During _______ time, all villagers go to the fields to cut rice.', '''harvest time'': mùa gặt, thời điểm thu hoạch.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q11_opt_0', 'mid1_q11', 0, 'A. leisure', FALSE),
('mid1_q11_opt_1', 'mid1_q11', 1, 'B. harvest', TRUE),
('mid1_q11_opt_2', 'mid1_q11', 2, 'C. festival', FALSE),
('mid1_q11_opt_3', 'mid1_q11', 3, 'D. tournament', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q12', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'She wanted to hang out with her friends, _______ she had to finish her project first.', 'Trước chỗ trống chỉ có 1 dấu phẩy (,) và 2 vế đối lập -> dùng liên từ ''but''.', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q12_opt_0', 'mid1_q12', 0, 'A. and', FALSE),
('mid1_q12_opt_1', 'mid1_q12', 1, 'B. so', FALSE),
('mid1_q12_opt_2', 'mid1_q12', 2, 'C. but', TRUE),
('mid1_q12_opt_3', 'mid1_q12', 3, 'D. however', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q13', 'exam-midterm-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Having too many extra classes can make students feel tired and _______.', 'Miêu tả cảm xúc của con người (students feel...) -> dùng tính từ đuôi -ed: ''stressed'' (căng thẳng).', 13)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q13_opt_0', 'mid1_q13', 0, 'A. stressful', FALSE),
('mid1_q13_opt_1', 'mid1_q13', 1, 'B. stressed', TRUE),
('mid1_q13_opt_2', 'mid1_q13', 2, 'C. user-friendly', FALSE),
('mid1_q13_opt_3', 'mid1_q13', 3, 'D. hospitable', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q14', 'exam-midterm-1', 'III. Communication (Giao tiếp)', 'Tom: ''Would you like to join our Arts and Crafts club this Sunday?'' — Mai: ''_______''', 'Để đáp lại lời mời ''Would you like to...?'' một cách lịch sự, ta dùng ''Yes, I''d love to''.', 14)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q14_opt_0', 'mid1_q14', 0, 'A. Yes, I''d love to. What time does it start?', TRUE),
('mid1_q14_opt_1', 'mid1_q14', 1, 'B. No, I detest.', FALSE),
('mid1_q14_opt_2', 'mid1_q14', 2, 'C. Yes, I fancy.', FALSE),
('mid1_q14_opt_3', 'mid1_q14', 3, 'D. You''re welcome.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q15', 'exam-midterm-1', 'III. Communication (Giao tiếp)', 'Lan: ''What a picturesque village you live in!'' — Phong: ''_______''', 'Lan khen ngôi làng đẹp như tranh vẽ (''What a picturesque village!'') -> Phong cảm ơn lời khen: ''Thank you! I''m glad you like it.''', 15)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q15_opt_0', 'mid1_q15', 0, 'A. No problem.', FALSE),
('mid1_q15_opt_1', 'mid1_q15', 1, 'B. Thank you! I''m glad you like it.', TRUE),
('mid1_q15_opt_2', 'mid1_q15', 2, 'C. Yes, please.', FALSE),
('mid1_q15_opt_3', 'mid1_q15', 3, 'D. Good idea!', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q16', 'exam-midterm-1', 'IV. Error Identification (Tìm lỗi sai)', 'Find the mistake: My brother <u>prefers</u> <u>play</u> badminton outdoors <u>to</u> watching TV <u>at home</u>.', 'Cấu trúc ''prefer + V-ing + to + V-ing'' -> phải sửa ''play'' thành ''playing''.', 16)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q16_opt_0', 'mid1_q16', 0, 'A. prefers', FALSE),
('mid1_q16_opt_1', 'mid1_q16', 1, 'B. play', TRUE),
('mid1_q16_opt_2', 'mid1_q16', 2, 'C. to', FALSE),
('mid1_q16_opt_3', 'mid1_q16', 3, 'D. at home', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q17', 'exam-midterm-1', 'IV. Error Identification (Tìm lỗi sai)', 'Find the mistake: Yesterday, our team <u>played</u> much <u>more badly</u> than <u>in</u> the previous <u>match</u>.', 'Trạng từ ''badly'' có dạng so sánh hơn bất quy tắc là ''worse'' (KHÔNG dùng ''more badly'').', 17)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q17_opt_0', 'mid1_q17', 0, 'A. played', FALSE),
('mid1_q17_opt_1', 'mid1_q17', 1, 'B. more badly', TRUE),
('mid1_q17_opt_2', 'mid1_q17', 2, 'C. in', FALSE),
('mid1_q17_opt_3', 'mid1_q17', 3, 'D. match', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q18', 'exam-midterm-1', 'IV. Error Identification (Tìm lỗi sai)', 'Find the mistake: You need to <u>wear</u> a helmet when <u>cycling</u>; <u>or</u>, you may get <u>injured</u>.', 'Giữa dấu chấm phẩy (;) và dấu phẩy (,) không được dùng ''or'', phải sửa thành ''otherwise''.', 18)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q18_opt_0', 'mid1_q18', 0, 'A. wear', FALSE),
('mid1_q18_opt_1', 'mid1_q18', 1, 'B. cycling', FALSE),
('mid1_q18_opt_2', 'mid1_q18', 2, 'C. or', TRUE),
('mid1_q18_opt_3', 'mid1_q18', 3, 'D. injured', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q19', 'exam-midterm-1', 'V. Reading Comprehension (Đọc hiểu)', '[Reading Q19] Where does academic pressure come from?', 'Thông tin ở câu thứ 2 trong bài: ''First, academic pressure comes from schoolwork, exams, and high expectations from parents and teachers.''', 19)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q19_opt_0', 'mid1_q19', 0, 'A. Only from friends on social media.', FALSE),
('mid1_q19_opt_1', 'mid1_q19', 1, 'B. From schoolwork, exams, and high expectations from parents and teachers.', TRUE),
('mid1_q19_opt_2', 'mid1_q19', 2, 'C. From joining too many school sports clubs.', FALSE),
('mid1_q19_opt_3', 'mid1_q19', 3, 'D. From living in the countryside.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q20', 'exam-midterm-1', 'V. Reading Comprehension (Đọc hiểu)', '[Reading Q20] Why do many eighth graders have very little leisure time?', 'Thông tin trong bài: ''Many eighth graders spend hours after school attending extra classes; therefore, they have very little leisure time to relax.''', 20)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q20_opt_0', 'mid1_q20', 0, 'A. Because they have to herd buffaloes.', FALSE),
('mid1_q20_opt_1', 'mid1_q20', 1, 'B. Because they spend hours after school attending extra classes.', TRUE),
('mid1_q20_opt_2', 'mid1_q20', 2, 'C. Because they don''t like leisure activities.', FALSE),
('mid1_q20_opt_3', 'mid1_q20', 3, 'D. Because they sleep too much.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q21', 'exam-midterm-1', 'V. Reading Comprehension (Đọc hiểu)', '[Reading Q21] What is a negative effect of spending too much time browsing the net?', 'Trong bài: ''...spending too much time browsing the net can make them lose concentration and sleep less soundly at night.''', 21)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q21_opt_0', 'mid1_q21', 0, 'A. It helps teens connect with friends.', FALSE),
('mid1_q21_opt_1', 'mid1_q21', 1, 'B. It helps teens share hobbies.', FALSE),
('mid1_q21_opt_2', 'mid1_q21', 2, 'C. It can make teens lose concentration and sleep less soundly.', TRUE),
('mid1_q21_opt_3', 'mid1_q21', 3, 'D. It helps teens meet their parents'' expectations.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q22', 'exam-midterm-1', 'V. Reading Comprehension (Đọc hiểu)', '[Reading Q22] According to the passage, which of the following is NOT mentioned as advice for teenagers?', 'Câu cuối khuyên: balance study and leisure (A), talk openly with parents (B), join school clubs (C). Không hề khuyên xóa hết mạng xã hội (D).', 22)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q22_opt_0', 'mid1_q22', 0, 'A. Balancing study and leisure activities.', FALSE),
('mid1_q22_opt_1', 'mid1_q22', 1, 'B. Talking openly with parents.', FALSE),
('mid1_q22_opt_2', 'mid1_q22', 2, 'C. Joining school clubs that match their interests.', FALSE),
('mid1_q22_opt_3', 'mid1_q22', 3, 'D. Deleting all social media accounts immediately.', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q23', 'exam-midterm-1', 'VI. Sentence Transformation (Viết lại câu)', 'Choose the sentence that has the same meaning: ''A horse can run 60 km/h. A camel can run 40 km/h.''', 'Ngựa chạy 60 km/h, lạc đà chạy 40 km/h -> Ngựa chạy nhanh hơn lạc đà (A horse can run faster than a camel).', 23)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q23_opt_0', 'mid1_q23', 0, 'A. A horse can run faster than a camel.', TRUE),
('mid1_q23_opt_1', 'mid1_q23', 1, 'B. A camel can run faster than a horse.', FALSE),
('mid1_q23_opt_2', 'mid1_q23', 2, 'C. A horse can run more slowly than a camel.', FALSE),
('mid1_q23_opt_3', 'mid1_q23', 3, 'D. A horse can run as fast as a camel.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q24', 'exam-midterm-1', 'VI. Sentence Transformation (Viết lại câu)', 'Choose the sentence that has the same meaning: ''Hoa is very fond of making crafts in her free time.''', '''be very fond of + V-ing'' (rất thích) tương đương với ''adore + V-ing''.', 24)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q24_opt_0', 'mid1_q24', 0, 'A. Hoa detests making crafts in her free time.', FALSE),
('mid1_q24_opt_1', 'mid1_q24', 1, 'B. Hoa adores making crafts in her free time.', TRUE),
('mid1_q24_opt_2', 'mid1_q24', 2, 'C. Hoa doesn''t mind to make crafts in her free time.', FALSE),
('mid1_q24_opt_3', 'mid1_q24', 3, 'D. Hoa fancies to make crafts in her free time.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('mid1_q25', 'exam-midterm-1', 'VI. Sentence Transformation (Viết lại câu)', 'Choose the correct compound sentence formed from: ''The rain was very heavy. The farmers still worked in the field.''', 'Hai mệnh đề mang nghĩa tương phản (mưa rất to >< nông dân vẫn làm việc ngoài đồng) và dùng trạng từ liên kết ''however'' phải có dấu chấm phẩy trước, dấu phẩy sau (; however,).', 25)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('mid1_q25_opt_0', 'mid1_q25', 0, 'A. The rain was very heavy, so the farmers still worked in the field.', FALSE),
('mid1_q25_opt_1', 'mid1_q25', 1, 'B. The rain was very heavy; therefore, the farmers still worked in the field.', FALSE),
('mid1_q25_opt_2', 'mid1_q25', 2, 'C. The rain was very heavy; however, the farmers still worked in the field.', TRUE),
('mid1_q25_opt_3', 'mid1_q25', 3, 'D. The rain was very heavy, however, the farmers still worked in the field.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('exam-final-1', 'course-eng-8-gs', NULL, NULL, 'Đề thi Cuối Học kì 1 - Đề số 01 (Tổng hợp Unit 1 – Unit 6)', 'final', 'Cuối Kì 1', 45, 'Toàn bộ Học kì 1 (Unit 1 đến Unit 6)', 'Đề thi chuẩn cấu trúc 30 câu (45 phút) bao quát toàn bộ từ vựng, ngữ âm và 6 chuyên đề ngữ pháp Học kì 1 có lời giải chi tiết từng câu.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q1', 'exam-final-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word whose underlined part is pronounced differently: A. s<u>oo</u>n   B. l<u>oo</u>k   C. b<u>oo</u>k   D. f<u>oo</u>t', '''soon'' phát âm là /suːn/ (âm /uː/ dài). Các từ look, book, foot phát âm là /ʊ/ ngắn.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q1_opt_0', 'fin1_q1', 0, 'A. soon', TRUE),
('fin1_q1_opt_1', 'fin1_q1', 1, 'B. look', FALSE),
('fin1_q1_opt_2', 'fin1_q1', 2, 'C. book', FALSE),
('fin1_q1_opt_3', 'fin1_q1', 3, 'D. foot', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q2', 'exam-final-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word whose underlined part is pronounced differently: A. <u>c</u>ostume   B. <u>c</u>ultural   C. <u>c</u>eremony   D. <u>c</u>ommunal', 'Chữ ''c'' trong ''ceremony'' đứng trước ''e'' nên phát âm là /s/ (/ˈserəməni/). Các từ còn lại phát âm là /k/.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q2_opt_0', 'fin1_q2', 0, 'A. costume', FALSE),
('fin1_q2_opt_1', 'fin1_q2', 1, 'B. cultural', FALSE),
('fin1_q2_opt_2', 'fin1_q2', 2, 'C. ceremony', TRUE),
('fin1_q2_opt_3', 'fin1_q2', 3, 'D. communal', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q3', 'exam-final-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word whose underlined part is pronounced differently: A. offe<u>r</u>ing   B. la<u>n</u>tern   C. tha<u>n</u>ksgiving   D. g<u>o</u>ng', 'Chữ ''n'' trong ''lantern'' phát âm là /n/. Các từ offering, thanksgiving, gong đều có âm mũi cuống lưỡi /ŋ/.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q3_opt_0', 'fin1_q3', 0, 'A. offering', FALSE),
('fin1_q3_opt_1', 'fin1_q3', 1, 'B. lantern', TRUE),
('fin1_q3_opt_2', 'fin1_q3', 2, 'C. thanksgiving', FALSE),
('fin1_q3_opt_3', 'fin1_q3', 3, 'D. gong', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q4', 'exam-final-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word that has a different stress pattern (trọng âm): A. minority   B. communal   C. tradition   D. costume', '''costume'' (/ˈkɒstjuːm/) có trọng âm rơi vào âm tiết 1. Các từ minority (/maɪˈnɒrəti/), communal (/kəˈmjuːnl/), tradition (/trəˈdɪʃn/) đều rơi vào âm tiết 2.', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q4_opt_0', 'fin1_q4', 0, 'A. minority', FALSE),
('fin1_q4_opt_1', 'fin1_q4', 1, 'B. communal', FALSE),
('fin1_q4_opt_2', 'fin1_q4', 2, 'C. tradition', FALSE),
('fin1_q4_opt_3', 'fin1_q4', 3, 'D. costume', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q5', 'exam-final-1', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word that has a different stress pattern (trọng âm): A. independent   B. interactive   C. acrobatics   D. longevity', '''longevity'' (/lɒnˈdʒevəti/) có trọng âm rơi vào âm tiết thứ 2. Các từ independent, interactive, acrobatics đều rơi vào âm tiết thứ 3.', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q5_opt_0', 'fin1_q5', 0, 'A. independent', FALSE),
('fin1_q5_opt_1', 'fin1_q5', 1, 'B. interactive', FALSE),
('fin1_q5_opt_2', 'fin1_q5', 2, 'C. acrobatics', FALSE),
('fin1_q5_opt_3', 'fin1_q5', 3, 'D. longevity', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q6', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'My younger brother detests _______ up early on cold winter mornings.', 'Sau ''detest'' bắt buộc dùng V-ing -> getting.', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q6_opt_0', 'fin1_q6', 0, 'A. get', FALSE),
('fin1_q6_opt_1', 'fin1_q6', 1, 'B. getting', TRUE),
('fin1_q6_opt_2', 'fin1_q6', 2, 'C. to get', FALSE),
('fin1_q6_opt_3', 'fin1_q6', 3, 'D. gets', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q7', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'With modern machines, farmers can plough the fields much _______ than they did with buffaloes.', 'Bổ nghĩa cho động từ ''plough'' -> dùng trạng từ so sánh hơn ''more quickly''.', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q7_opt_0', 'fin1_q7', 0, 'A. more quickly', TRUE),
('fin1_q7_opt_1', 'fin1_q7', 1, 'B. quicklier', FALSE),
('fin1_q7_opt_2', 'fin1_q7', 2, 'C. more quick', FALSE),
('fin1_q7_opt_3', 'fin1_q7', 3, 'D. quick', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q8', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'You should review Units 1 to 6 carefully; _______, you won''t get a high score in the final exam.', 'Có dấu `; _______ ,` và mang nghĩa ''nếu không thì'' -> chọn ''otherwise''.', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q8_opt_0', 'fin1_q8', 0, 'A. therefore', FALSE),
('fin1_q8_opt_1', 'fin1_q8', 1, 'B. however', FALSE),
('fin1_q8_opt_2', 'fin1_q8', 2, 'C. otherwise', TRUE),
('fin1_q8_opt_3', 'fin1_q8', 3, 'D. or', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q9', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'How _______ ethnic minority groups live in the Central Highlands?', '''groups'' là danh từ đếm được số nhiều -> dùng ''How many''.', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q9_opt_0', 'fin1_q9', 0, 'A. much', FALSE),
('fin1_q9_opt_1', 'fin1_q9', 1, 'B. many', TRUE),
('fin1_q9_opt_2', 'fin1_q9', 2, 'C. little', FALSE),
('fin1_q9_opt_3', 'fin1_q9', 3, 'D. a little', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q10', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Could you give me _______ information about the Whale Festival in Quang Nam?', '''information'' là danh từ không đếm được, trong câu đề nghị lịch sự (''Could you...?'') ta dùng ''some''.', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q10_opt_0', 'fin1_q10', 0, 'A. a', FALSE),
('fin1_q10_opt_1', 'fin1_q10', 1, 'B. an', FALSE),
('fin1_q10_opt_2', 'fin1_q10', 2, 'C. many', FALSE),
('fin1_q10_opt_3', 'fin1_q10', 3, 'D. some', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q11', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', '_______ Hmong women are very skilful at weaving and making colourful costumes.', 'Chú ý phân biệt: Nếu chỉ có tên dân tộc (''The Hmong'') thì dùng ''The''. Nhưng ở đây có danh từ số nhiều ''Hmong women'' (phụ nữ người Mông nói chung) -> không dùng mạo từ (Ø) hoặc nếu chỉ tập thể xác định. Trong SGK Global Success Unit 5: ''Hmong women'' nói chung không dùng mạo từ.', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q11_opt_0', 'fin1_q11', 0, 'A. A', FALSE),
('fin1_q11_opt_1', 'fin1_q11', 1, 'B. An', FALSE),
('fin1_q11_opt_2', 'fin1_q11', 2, 'C. The', FALSE),
('fin1_q11_opt_3', 'fin1_q11', 3, 'D. Ø (no article)', TRUE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q12', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'The Hung Kings Temple Festival takes place on _______ 10th day of the third lunar month.', 'Trước số thứ tự ''10th'' (the tenth day) bắt buộc dùng mạo từ ''the''.', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q12_opt_0', 'fin1_q12', 0, 'A. a', FALSE),
('fin1_q12_opt_1', 'fin1_q12', 1, 'B. an', FALSE),
('fin1_q12_opt_2', 'fin1_q12', 2, 'C. the', TRUE),
('fin1_q12_opt_3', 'fin1_q12', 3, 'D. Ø', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q13', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'If it _______ heavily tomorrow morning, the school sports tournament will be postponed.', 'Câu điều kiện loại 1: mệnh đề ''If'' chia Hiện tại đơn. Chủ ngữ ''it'' -> ''rains''.', 13)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q13_opt_0', 'fin1_q13', 0, 'A. rains', TRUE),
('fin1_q13_opt_1', 'fin1_q13', 1, 'B. will rain', FALSE),
('fin1_q13_opt_2', 'fin1_q13', 2, 'C. rained', FALSE),
('fin1_q13_opt_3', 'fin1_q13', 3, 'D. raining', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q14', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Unless you _______ off your phone notifications, you won''t be able to concentrate on your lesson.', 'Sau ''Unless'' dùng mệnh đề khẳng định ở thì Hiện tại đơn -> ''turn''.', 14)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q14_opt_0', 'fin1_q14', 0, 'A. don''t turn', FALSE),
('fin1_q14_opt_1', 'fin1_q14', 1, 'B. will turn', FALSE),
('fin1_q14_opt_2', 'fin1_q14', 2, 'C. turn', TRUE),
('fin1_q14_opt_3', 'fin1_q14', 3, 'D. turned', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q15', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Many ethnic minority families in the northern mountains live in wooden _______ houses.', '''stilt houses'': nhà sàn.', 15)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q15_opt_0', 'fin1_q15', 0, 'A. terraced', FALSE),
('fin1_q15_opt_1', 'fin1_q15', 1, 'B. stilt', TRUE),
('fin1_q15_opt_2', 'fin1_q15', 2, 'C. coastal', FALSE),
('fin1_q15_opt_3', 'fin1_q15', 3, 'D. ornamental', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q16', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'At Tet, Vietnamese people prepare food _______ to place on the ancestral altar.', '''food offerings'': mâm cỗ cúng / lễ vật dâng lên bàn thờ tổ tiên (ancestral altar).', 16)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q16_opt_0', 'fin1_q16', 0, 'A. offerings', TRUE),
('fin1_q16_opt_1', 'fin1_q16', 1, 'B. lanterns', FALSE),
('fin1_q16_opt_2', 'fin1_q16', 2, 'C. acrobatics', FALSE),
('fin1_q16_opt_3', 'fin1_q16', 3, 'D. dogsleds', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q17', 'exam-final-1', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'City people are often _______ a hurry, so they like fast food or convenient street food.', 'Cụm từ cố định: ''in a hurry'' (đang vội vàng).', 17)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q17_opt_0', 'fin1_q17', 0, 'A. on', FALSE),
('fin1_q17_opt_1', 'fin1_q17', 1, 'B. at', FALSE),
('fin1_q17_opt_2', 'fin1_q17', 2, 'C. in', TRUE),
('fin1_q17_opt_3', 'fin1_q17', 3, 'D. with', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q18', 'exam-final-1', 'III. Communication (Giao tiếp)', 'Mai: ''In my family, children always greet elders by folding their arms and bowing.'' — Nick: ''_______''', 'Mai kể về một phong tục đẹp trong gia đình -> Nick khen ngợi phong tục đó (''That''s a nice custom! It shows great respect.'').', 18)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q18_opt_0', 'fin1_q18', 0, 'A. That''s a nice custom! It shows great respect.', TRUE),
('fin1_q18_opt_1', 'fin1_q18', 1, 'B. I''m sorry to hear that.', FALSE),
('fin1_q18_opt_2', 'fin1_q18', 2, 'C. Yes, I''d love to.', FALSE),
('fin1_q18_opt_3', 'fin1_q18', 3, 'D. Never mind.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q19', 'exam-final-1', 'IV. Error Identification (Tìm lỗi sai)', 'Find the mistake: My sister is <u>in</u> the habit of <u>listen</u> to English podcasts <u>before</u> going <u>to bed</u>.', 'Sau giới từ ''of'' (trong cụm ''in the habit of'') động từ phải ở dạng V-ing -> sửa ''listen'' thành ''listening''.', 19)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q19_opt_0', 'fin1_q19', 0, 'A. in', FALSE),
('fin1_q19_opt_1', 'fin1_q19', 1, 'B. listen', TRUE),
('fin1_q19_opt_2', 'fin1_q19', 2, 'C. before', FALSE),
('fin1_q19_opt_3', 'fin1_q19', 3, 'D. to bed', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q20', 'exam-final-1', 'IV. Error Identification (Tìm lỗi sai)', 'Find the mistake: <u>How many</u> <u>butter</u> do we need <u>to make</u> this birthday <u>cake</u>?', '''butter'' (bơ) là danh từ KHÔNG đếm được -> phải sửa ''How many'' thành ''How much''.', 20)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q20_opt_0', 'fin1_q20', 0, 'A. How many', TRUE),
('fin1_q20_opt_1', 'fin1_q20', 1, 'B. butter', FALSE),
('fin1_q20_opt_2', 'fin1_q20', 2, 'C. to make', FALSE),
('fin1_q20_opt_3', 'fin1_q20', 3, 'D. cake', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q21', 'exam-final-1', 'IV. Error Identification (Tìm lỗi sai)', 'Find the mistake: We usually have <u>the</u> dinner together <u>at</u> 7 p.m. and <u>watch</u> the news <u>on</u> TV.', 'Trước tên các bữa ăn (breakfast, lunch, dinner) nói chung ta KHÔNG dùng mạo từ -> bỏ ''the'' (have dinner).', 21)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q21_opt_0', 'fin1_q21', 0, 'A. the', TRUE),
('fin1_q21_opt_1', 'fin1_q21', 1, 'B. at', FALSE),
('fin1_q21_opt_2', 'fin1_q21', 2, 'C. watch', FALSE),
('fin1_q21_opt_3', 'fin1_q21', 3, 'D. on', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q22', 'exam-final-1', 'V. Cloze Reading (Đọc điền từ vào đoạn văn)', '[Cloze Q22] Choose the correct word for blank (22):', '''ornamental trees'': cây cảnh trang trí (như cây quất, hoa đào, hoa mai).', 22)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q22_opt_0', 'fin1_q22', 0, 'A. ornamental', TRUE),
('fin1_q22_opt_1', 'fin1_q22', 1, 'B. coastal', FALSE),
('fin1_q22_opt_2', 'fin1_q22', 2, 'C. nomadic', FALSE),
('fin1_q22_opt_3', 'fin1_q22', 3, 'D. communal', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q23', 'exam-final-1', 'V. Cloze Reading (Đọc điền từ vào đoạn văn)', '[Cloze Q23] Choose the correct word for blank (23):', '''family reunion dinner'': bữa cơm đoàn tụ / tất niên gia đình.', 23)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q23_opt_0', 'fin1_q23', 0, 'A. tournament', FALSE),
('fin1_q23_opt_1', 'fin1_q23', 1, 'B. reunion', TRUE),
('fin1_q23_opt_2', 'fin1_q23', 2, 'C. pressure', FALSE),
('fin1_q23_opt_3', 'fin1_q23', 3, 'D. livestock', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q24', 'exam-final-1', 'V. Cloze Reading (Đọc điền từ vào đoạn văn)', '[Cloze Q24] Choose the correct word for blank (24):', '''worship ancestors'': thờ cúng tổ tiên.', 24)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q24_opt_0', 'fin1_q24', 0, 'A. chase', FALSE),
('fin1_q24_opt_1', 'fin1_q24', 1, 'B. weave', FALSE),
('fin1_q24_opt_2', 'fin1_q24', 2, 'C. worship', TRUE),
('fin1_q24_opt_3', 'fin1_q24', 3, 'D. browse', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q25', 'exam-final-1', 'V. Cloze Reading (Đọc điền từ vào đoạn văn)', '[Cloze Q25] Choose the correct word for blank (25):', 'Câu điều kiện loại 1: ''if they do good things ..., they WILL have good luck...''.', 25)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q25_opt_0', 'fin1_q25', 0, 'A. will', TRUE),
('fin1_q25_opt_1', 'fin1_q25', 1, 'B. did', FALSE),
('fin1_q25_opt_2', 'fin1_q25', 2, 'C. are', FALSE),
('fin1_q25_opt_3', 'fin1_q25', 3, 'D. were', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q26', 'exam-final-1', 'VI. Reading Comprehension (Đọc hiểu trả lời câu hỏi)', '[Reading Q26] What is the population rank of the Tay among ethnic groups in Viet Nam?', 'Câu đầu tiên: ''...the Tay are the second largest ethnic group in Viet Nam, just after the Kinh majority.''', 26)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q26_opt_0', 'fin1_q26', 0, 'A. The largest ethnic group.', FALSE),
('fin1_q26_opt_1', 'fin1_q26', 1, 'B. The second largest ethnic group.', TRUE),
('fin1_q26_opt_2', 'fin1_q26', 2, 'C. The third largest ethnic group.', FALSE),
('fin1_q26_opt_3', 'fin1_q26', 3, 'D. The smallest ethnic group.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q27', 'exam-final-1', 'VI. Reading Comprehension (Đọc hiểu trả lời câu hỏi)', '[Reading Q27] What is ''Then'' singing?', 'Trong bài: ''...the Tay are famous for Then singing — a traditional musical art recognized by UNESCO...''', 27)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q27_opt_0', 'fin1_q27', 0, 'A. A kind of traditional stilt house.', FALSE),
('fin1_q27_opt_1', 'fin1_q27', 1, 'B. A traditional musical art of the Tay recognized by UNESCO.', TRUE),
('fin1_q27_opt_2', 'fin1_q27', 2, 'C. A special dish made from sticky rice.', FALSE),
('fin1_q27_opt_3', 'fin1_q27', 3, 'D. A farming tool used on terraced fields.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q28', 'exam-final-1', 'VI. Reading Comprehension (Đọc hiểu trả lời câu hỏi)', '[Reading Q28] Which statement is TRUE according to the passage?', 'Câu cuối trong bài: ''During spring festivals, Tay women wear simple indigo costumes with silver necklaces...''.', 28)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q28_opt_0', 'fin1_q28', 0, 'A. The Tay mainly live in the Central Highlands.', FALSE),
('fin1_q28_opt_1', 'fin1_q28', 1, 'B. The Tay do not know how to grow wet rice.', FALSE),
('fin1_q28_opt_2', 'fin1_q28', 2, 'C. Tay women wear indigo costumes with silver necklaces during spring festivals.', TRUE),
('fin1_q28_opt_3', 'fin1_q28', 3, 'D. The Tay live in igloos.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q29', 'exam-final-1', 'VII. Sentence Transformation (Viết lại câu)', 'Choose the sentence with the same meaning: ''If we don''t protect traditional crafts, they will disappear soon.''', '''If we don''t protect...'' = ''Unless we protect...'', mệnh đề chính giữ nguyên ''they will disappear soon''.', 29)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q29_opt_0', 'fin1_q29', 0, 'A. Unless we protect traditional crafts, they will disappear soon.', TRUE),
('fin1_q29_opt_1', 'fin1_q29', 1, 'B. Unless we don''t protect traditional crafts, they will disappear soon.', FALSE),
('fin1_q29_opt_2', 'fin1_q29', 2, 'C. If we protect traditional crafts, they will disappear soon.', FALSE),
('fin1_q29_opt_3', 'fin1_q29', 3, 'D. Unless we protect traditional crafts, they won''t disappear soon.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin1_q30', 'exam-final-1', 'VII. Sentence Transformation (Viết lại câu)', 'Make a question for the underlined part: ''The villagers hold the festival <u>in the communal house</u>.''', 'Phần gạch chân ''in the communal house'' (trong nhà rông) chỉ nơi chốn -> dùng từ để hỏi ''Where''.', 30)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin1_q30_opt_0', 'fin1_q30', 0, 'A. When do the villagers hold the festival?', FALSE),
('fin1_q30_opt_1', 'fin1_q30', 1, 'B. Where do the villagers hold the festival?', TRUE),
('fin1_q30_opt_2', 'fin1_q30', 2, 'C. Why do the villagers hold the festival?', FALSE),
('fin1_q30_opt_3', 'fin1_q30', 3, 'D. How often do the villagers hold the festival?', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO exercises (id, course_id, unit_id, lesson_id, title, category, badge, duration_minutes, scope, description) VALUES
('exam-final-2', 'course-eng-8-gs', NULL, NULL, 'Đề thi Cuối Học kì 1 - Đề số 02 (Nâng cao & Bẫy hay sai)', 'final', 'Cuối Kì 1', 45, 'Toàn bộ Học kì 1 (Unit 1 đến Unit 6) - Mức độ Vận dụng', 'Đề 30 câu xoáy sâu vào các câu bẫy ngữ âm, mạo từ đặc biệt, danh từ bất quy tắc, phân biệt liên từ/trạng từ liên kết và viết lại câu để đạt 9–10 điểm.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q1', 'exam-final-2', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word whose underlined part is pronounced differently: A. w<u>o</u>lf   B. w<u>o</u>uld   C. gr<u>ou</u>p   D. f<u>oo</u>t', '''group'' (/ɡruːp/) có âm /uː/ dài. Các từ wolf (/wʊlf/), would (/wʊd/), foot (/fʊt/) có âm /ʊ/ ngắn.', 1)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q1_opt_0', 'fin2_q1', 0, 'A. wolf', FALSE),
('fin2_q1_opt_1', 'fin2_q1', 1, 'B. would', FALSE),
('fin2_q1_opt_2', 'fin2_q1', 2, 'C. group', TRUE),
('fin2_q1_opt_3', 'fin2_q1', 3, 'D. foot', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q2', 'exam-final-2', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word whose underlined part is pronounced differently: A. l<u>a</u>nguage   B. pi<u>n</u>k   C. lo<u>n</u>gevity   D. u<u>n</u>cle', 'Chữ ''n'' trong ''longevity'' (/lɒnˈdʒevəti/) đứng trước âm /dʒ/ nên phát âm là /n/. Trong language, pink, uncle chữ ''n'' đứng trước /ɡ/, /k/ nên phát âm là /ŋ/.', 2)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q2_opt_0', 'fin2_q2', 0, 'A. language', FALSE),
('fin2_q2_opt_1', 'fin2_q2', 1, 'B. pink', FALSE),
('fin2_q2_opt_2', 'fin2_q2', 2, 'C. longevity', TRUE),
('fin2_q2_opt_3', 'fin2_q2', 3, 'D. uncle', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q3', 'exam-final-2', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word whose underlined part is pronounced differently: A. herita<u>g</u>e   B. villa<u>g</u>er   C. <u>g</u>ather   D. lon<u>g</u>evity', 'Chữ ''g'' trong ''gather'' (/ˈɡæðə(r)/) phát âm là /ɡ/. Trong heritage, villager, longevity chữ ''g'' đứng trước e, i nên phát âm là /dʒ/.', 3)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q3_opt_0', 'fin2_q3', 0, 'A. heritage', FALSE),
('fin2_q3_opt_1', 'fin2_q3', 1, 'B. villager', FALSE),
('fin2_q3_opt_2', 'fin2_q3', 2, 'C. gather', TRUE),
('fin2_q3_opt_3', 'fin2_q3', 3, 'D. longevity', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q4', 'exam-final-2', 'I. Pronunciation & Stress (Ngữ âm & Trọng âm)', 'Choose the word that has a different stress pattern: A. notification   B. expectation   C. hospitable   D. celebration', '''hospitable'' (/hɒˈspɪtəbl/ hoặc /ˈhɒspɪtəbl/) rơi vào âm 1 hoặc 2, trong khi các từ có đuôi -tion (notification, expectation, celebration) đều có trọng âm rơi ngay trước -tion.', 4)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q4_opt_0', 'fin2_q4', 0, 'A. notification', FALSE),
('fin2_q4_opt_1', 'fin2_q4', 1, 'B. expectation', FALSE),
('fin2_q4_opt_2', 'fin2_q4', 2, 'C. hospitable', TRUE),
('fin2_q4_opt_3', 'fin2_q4', 3, 'D. celebration', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q5', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'I don''t mind _______ you with your DIY project, but I''d prefer _______ it this Saturday.', 'Sau ''mind'' bắt buộc dùng V-ing (helping); sau ''would prefer'' (''d prefer) dùng ''to + V nguyên thể'' (to do).', 5)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q5_opt_0', 'fin2_q5', 0, 'A. helping / to do', TRUE),
('fin2_q5_opt_1', 'fin2_q5', 1, 'B. to help / doing', FALSE),
('fin2_q5_opt_2', 'fin2_q5', 2, 'C. helping / doing', FALSE),
('fin2_q5_opt_3', 'fin2_q5', 3, 'D. help / to do', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q6', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Among the two sisters, Mai works _______, so her teacher always praises her.', 'Trạng từ của ''hard'' (chăm chỉ) vẫn là ''hard'', dạng so sánh hơn là ''harder''. (''hardly'' có nghĩa là ''hầu như không'').', 6)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q6_opt_0', 'fin2_q6', 0, 'A. more hardly', FALSE),
('fin2_q6_opt_1', 'fin2_q6', 1, 'B. harder', TRUE),
('fin2_q6_opt_2', 'fin2_q6', 2, 'C. more hard', FALSE),
('fin2_q6_opt_3', 'fin2_q6', 3, 'D. hardlier', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q7', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Teenagers can learn teamwork skills at school clubs; _______, they can make many new friends there.', 'Dấu `; _______ ,` và vế sau bổ sung thêm một lợi ích nữa -> dùng ''moreover'' (hơn thế nữa).', 7)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q7_opt_0', 'fin2_q7', 0, 'A. however', FALSE),
('fin2_q7_opt_1', 'fin2_q7', 1, 'B. otherwise', FALSE),
('fin2_q7_opt_2', 'fin2_q7', 2, 'C. moreover', TRUE),
('fin2_q7_opt_3', 'fin2_q7', 3, 'D. but', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q8', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Look! Some _______ are grazing peacefully on the vast green pasture.', '''cattle'' (gia súc: trâu, bò) là danh từ tập hợp LUÔN mang nghĩa số nhiều (đi với động từ ''are grazing'') và không thêm ''s''.', 8)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q8_opt_0', 'fin2_q8', 0, 'A. cattle', TRUE),
('fin2_q8_opt_1', 'fin2_q8', 1, 'B. a cattle', FALSE),
('fin2_q8_opt_2', 'fin2_q8', 2, 'C. cattles', FALSE),
('fin2_q8_opt_3', 'fin2_q8', 3, 'D. livestock', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q9', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'We only have _______ time left before the exam starts, so hurry up!', '''time'' (thời gian) là danh từ không đếm được -> dùng ''a little'' (một chút thời gian).', 9)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q9_opt_0', 'fin2_q9', 0, 'A. a few', FALSE),
('fin2_q9_opt_1', 'fin2_q9', 1, 'B. many', FALSE),
('fin2_q9_opt_2', 'fin2_q9', 2, 'C. a little', TRUE),
('fin2_q9_opt_3', 'fin2_q9', 3, 'D. any', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q10', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'It is _______ honour for our village to welcome visitors to _______ Ok Om Bok Festival.', '''honour'' (niềm vinh dự) có chữ ''h'' câm (/ˈɒnə(r)/) -> dùng ''an''. Trước tên lễ hội có chữ ''Festival'' -> dùng ''the'' (the Ok Om Bok Festival).', 10)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q10_opt_0', 'fin2_q10', 0, 'A. a / the', FALSE),
('fin2_q10_opt_1', 'fin2_q10', 1, 'B. an / the', TRUE),
('fin2_q10_opt_2', 'fin2_q10', 2, 'C. an / Ø', FALSE),
('fin2_q10_opt_3', 'fin2_q10', 3, 'D. the / a', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q11', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'My cousin can play _______ bamboo flute very well, and he also loves playing _______ chess.', 'Trước tên nhạc cụ dùng ''the'' (play the bamboo flute); trước tên môn thể thao/trò chơi KHÔNG dùng mạo từ (play Ø chess).', 11)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q11_opt_0', 'fin2_q11', 0, 'A. the / Ø', TRUE),
('fin2_q11_opt_1', 'fin2_q11', 1, 'B. Ø / the', FALSE),
('fin2_q11_opt_2', 'fin2_q11', 2, 'C. the / the', FALSE),
('fin2_q11_opt_3', 'fin2_q11', 3, 'D. a / Ø', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q12', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', '_______ will happen if people stop maintaining their traditional customs?', '''What will happen if...?'' (Điều gì sẽ xảy ra nếu...?).', 12)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q12_opt_0', 'fin2_q12', 0, 'A. Which', FALSE),
('fin2_q12_opt_1', 'fin2_q12', 1, 'B. What', TRUE),
('fin2_q12_opt_2', 'fin2_q12', 2, 'C. How many', FALSE),
('fin2_q12_opt_3', 'fin2_q12', 3, 'D. Where', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q13', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'If a visitor _______ a stilt house of the Thai, he should take off his shoes at the bottom of the staircase.', 'Câu điều kiện loại 1 (mệnh đề chính dùng modal ''should''): mệnh đề ''If'' chia Hiện tại đơn, chủ ngữ số ít ''a visitor'' -> ''enters''.', 13)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q13_opt_0', 'fin2_q13', 0, 'A. enter', FALSE),
('fin2_q13_opt_1', 'fin2_q13', 1, 'B. enters', TRUE),
('fin2_q13_opt_2', 'fin2_q13', 2, 'C. will enter', FALSE),
('fin2_q13_opt_3', 'fin2_q13', 3, 'D. entered', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q14', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Online learning is convenient; _______, it requires students to be more independent and self-disciplined.', 'Vế 1 khen tiện lợi, vế 2 nêu yêu cầu/khó khăn và có dấu `; _______ ,` -> chọn ''however'' (tuy nhiên).', 14)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q14_opt_0', 'fin2_q14', 0, 'A. therefore', FALSE),
('fin2_q14_opt_1', 'fin2_q14', 1, 'B. however', TRUE),
('fin2_q14_opt_2', 'fin2_q14', 2, 'C. otherwise', FALSE),
('fin2_q14_opt_3', 'fin2_q14', 3, 'D. so', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q15', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'A traditional stilt house is built on strong wooden _______, about two metres above the ground.', '''wooden posts'': những chiếc cột gỗ vững chắc chống đỡ nhà sàn.', 15)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q15_opt_0', 'fin2_q15', 0, 'A. posts', TRUE),
('fin2_q15_opt_1', 'fin2_q15', 1, 'B. lanterns', FALSE),
('fin2_q15_opt_2', 'fin2_q15', 2, 'C. carps', FALSE),
('fin2_q15_opt_3', 'fin2_q15', 3, 'D. orchards', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q16', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'Some young people today _______ with tradition by choosing to travel during Tet instead of staying at home.', 'Cụm từ cố định trong Unit 5: ''break with tradition'' (phá vỡ truyền thống / làm khác đi so với truyền thống).', 16)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q16_opt_0', 'fin2_q16', 0, 'A. chase', FALSE),
('fin2_q16_opt_1', 'fin2_q16', 1, 'B. break', TRUE),
('fin2_q16_opt_2', 'fin2_q16', 2, 'C. worship', FALSE),
('fin2_q16_opt_3', 'fin2_q16', 3, 'D. maintain', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q17', 'exam-final-2', 'II. Vocabulary & Grammar (Từ vựng & Ngữ pháp)', 'In the past, Mongolian nomads moved several times a year to find new pastures for their _______.', 'Người du mục di chuyển tìm đồng cỏ mới (pastures) cho đàn gia súc (''livestock'').', 17)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q17_opt_0', 'fin2_q17', 0, 'A. poultry', FALSE),
('fin2_q17_opt_1', 'fin2_q17', 1, 'B. livestock', TRUE),
('fin2_q17_opt_2', 'fin2_q17', 2, 'C. crops', FALSE),
('fin2_q17_opt_3', 'fin2_q17', 3, 'D. crafts', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q18', 'exam-final-2', 'III. Error Identification (Tìm lỗi sai)', 'Find the mistake: The <u>traditional</u> costume of <u>a</u> Dao women <u>is</u> very colourful and <u>impressive</u>.', '''women'' là danh từ số nhiều -> không thể dùng mạo từ ''a'' phía trước (sửa ''a'' thành ''the'').', 18)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q18_opt_0', 'fin2_q18', 0, 'A. traditional', FALSE),
('fin2_q18_opt_1', 'fin2_q18', 1, 'B. a', TRUE),
('fin2_q18_opt_2', 'fin2_q18', 2, 'C. is', FALSE),
('fin2_q18_opt_3', 'fin2_q18', 3, 'D. impressive', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q19', 'exam-final-2', 'III. Error Identification (Tìm lỗi sai)', 'Find the mistake: She <u>speaks</u> English <u>more fluent</u> than her sister <u>because</u> she practices every <u>day</u>.', 'Bổ nghĩa cho động từ thường ''speaks'' phải dùng trạng từ -> sửa ''more fluent'' thành ''more fluently''.', 19)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q19_opt_0', 'fin2_q19', 0, 'A. speaks', FALSE),
('fin2_q19_opt_1', 'fin2_q19', 1, 'B. more fluent', TRUE),
('fin2_q19_opt_2', 'fin2_q19', 2, 'C. because', FALSE),
('fin2_q19_opt_3', 'fin2_q19', 3, 'D. day', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q20', 'exam-final-2', 'III. Error Identification (Tìm lỗi sai)', 'Find the mistake: <u>Where</u> did you <u>went</u> with your classmates <u>after</u> the final exam <u>last week</u>?', 'Trong câu hỏi quá khứ đơn đã mượn trợ động từ ''did'', động từ chính phải ở dạng nguyên thể -> sửa ''went'' thành ''go''.', 20)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q20_opt_0', 'fin2_q20', 0, 'A. Where', FALSE),
('fin2_q20_opt_1', 'fin2_q20', 1, 'B. went', TRUE),
('fin2_q20_opt_2', 'fin2_q20', 2, 'C. after', FALSE),
('fin2_q20_opt_3', 'fin2_q20', 3, 'D. last week', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q21', 'exam-final-2', 'IV. Cloze Reading (Đọc điền từ)', '[Cloze Q21] Choose the correct word for blank (21):', '''online learning'': học trực tuyến.', 21)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q21_opt_0', 'fin2_q21', 0, 'A. online', TRUE),
('fin2_q21_opt_1', 'fin2_q21', 1, 'B. nomadic', FALSE),
('fin2_q21_opt_2', 'fin2_q21', 2, 'C. coastal', FALSE),
('fin2_q21_opt_3', 'fin2_q21', 3, 'D. folk', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q22', 'exam-final-2', 'IV. Cloze Reading (Đọc điền từ)', '[Cloze Q22] Choose the correct word for blank (22):', '''interactive lessons'': các bài học có tính tương tác.', 22)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q22_opt_0', 'fin2_q22', 0, 'A. hospitable', FALSE),
('fin2_q22_opt_1', 'fin2_q22', 1, 'B. interactive', TRUE),
('fin2_q22_opt_2', 'fin2_q22', 2, 'C. terraced', FALSE),
('fin2_q22_opt_3', 'fin2_q22', 3, 'D. ornamental', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q23', 'exam-final-2', 'IV. Cloze Reading (Đọc điền từ)', '[Cloze Q23] Choose the correct word for blank (23):', 'Có dấu `; _______ ,` và nối 2 ý đối lập (ưu điểm >< nhược điểm ''drawbacks'') -> chọn ''however''.', 23)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q23_opt_0', 'fin2_q23', 0, 'A. therefore', FALSE),
('fin2_q23_opt_1', 'fin2_q23', 1, 'B. otherwise', FALSE),
('fin2_q23_opt_2', 'fin2_q23', 2, 'C. however', TRUE),
('fin2_q23_opt_3', 'fin2_q23', 3, 'D. so', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q24', 'exam-final-2', 'IV. Cloze Reading (Đọc điền từ)', '[Cloze Q24] Choose the correct word for blank (24):', 'Cụm từ cố định: ''in the habit of + V-ing'' (có thói quen làm gì).', 24)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q24_opt_0', 'fin2_q24', 0, 'A. custom', FALSE),
('fin2_q24_opt_1', 'fin2_q24', 1, 'B. habit', TRUE),
('fin2_q24_opt_2', 'fin2_q24', 2, 'C. hurry', FALSE),
('fin2_q24_opt_3', 'fin2_q24', 3, 'D. pressure', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q25', 'exam-final-2', 'IV. Cloze Reading (Đọc điền từ)', '[Cloze Q25] Choose the correct word for blank (25):', 'Câu điều kiện loại 1 (''If this trend continues, ... will lose...'').', 25)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q25_opt_0', 'fin2_q25', 0, 'A. will', TRUE),
('fin2_q25_opt_1', 'fin2_q25', 1, 'B. did', FALSE),
('fin2_q25_opt_2', 'fin2_q25', 2, 'C. are', FALSE),
('fin2_q25_opt_3', 'fin2_q25', 3, 'D. have', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q26', 'exam-final-2', 'V. Reading Comprehension (Đọc hiểu)', '[Reading Q26] How is a traditional Vietnamese meal usually served?', 'Câu thứ 2 trong bài: ''A traditional Vietnamese meal is usually served on a round tray with a big bowl of rice in the middle and shared dishes around it.''', 26)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q26_opt_0', 'fin2_q26', 0, 'A. Each person has their own separate tray of food.', FALSE),
('fin2_q26_opt_1', 'fin2_q26', 1, 'B. On a round tray with a big bowl of rice in the middle and shared dishes around it.', TRUE),
('fin2_q26_opt_2', 'fin2_q26', 2, 'C. People stand while eating street food.', FALSE),
('fin2_q26_opt_3', 'fin2_q26', 3, 'D. People use forks and knives instead of chopsticks.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q27', 'exam-final-2', 'V. Reading Comprehension (Đọc hiểu)', '[Reading Q27] Why shouldn''t you stick your chopsticks straight up in a bowl of rice?', 'Trong bài: ''...never stick your chopsticks straight up in a bowl of rice because it looks like incense sticks for the dead'' (giống bát hương cúng người khuất).', 27)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q27_opt_0', 'fin2_q27', 0, 'A. Because the bowl may break.', FALSE),
('fin2_q27_opt_1', 'fin2_q27', 1, 'B. Because it makes the rice cold.', FALSE),
('fin2_q27_opt_2', 'fin2_q27', 2, 'C. Because it looks like incense sticks for the dead.', TRUE),
('fin2_q27_opt_3', 'fin2_q27', 3, 'D. Because elders don''t like eating rice.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q28', 'exam-final-2', 'V. Reading Comprehension (Đọc hiểu)', '[Reading Q28] What should young family members do before starting the meal?', 'Trong bài: ''Before eating, the youngest members of the family always invite the elders to start first...''.', 28)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q28_opt_0', 'fin2_q28', 0, 'A. Eat the best piece of food first.', FALSE),
('fin2_q28_opt_1', 'fin2_q28', 1, 'B. Invite the elders to start eating first.', TRUE),
('fin2_q28_opt_2', 'fin2_q28', 2, 'C. Tap their bowls with chopsticks.', FALSE),
('fin2_q28_opt_3', 'fin2_q28', 3, 'D. Flip the fish on the plate.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q29', 'exam-final-2', 'VI. Sentence Transformation (Viết lại câu)', 'Choose the sentence with the same meaning: ''If she doesn''t practice speaking English every day, she won''t improve her pronunciation.''', 'Đổi ''If she doesn''t practice...'' sang ''Unless'': bỏ ''doesn''t'' thì động từ ''practice'' đi với chủ ngữ số ít ''she'' phải thêm ''-s'' -> ''Unless she practices...'', mệnh đề chính giữ nguyên.', 29)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q29_opt_0', 'fin2_q29', 0, 'A. Unless she practices speaking English every day, she won''t improve her pronunciation.', TRUE),
('fin2_q29_opt_1', 'fin2_q29', 1, 'B. Unless she practice speaking English every day, she won''t improve her pronunciation.', FALSE),
('fin2_q29_opt_2', 'fin2_q29', 2, 'C. Unless she doesn''t practice speaking English every day, she won''t improve her pronunciation.', FALSE),
('fin2_q29_opt_3', 'fin2_q29', 3, 'D. Unless she practices speaking English every day, she will improve her pronunciation.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

INSERT INTO questions (id, exercise_id, section, question_text, explanation, order_index) VALUES
('fin2_q30', 'exam-final-2', 'VI. Sentence Transformation (Viết lại câu)', 'Choose the sentence with the same meaning: ''In the past, villagers travelled less far than they do today.''', '''Ngày xưa dân làng đi lại ít xa hơn ngày nay'' = ''Ngày nay dân làng đi lại xa hơn (farther) so với ngày xưa''.', 30)
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text, explanation = EXCLUDED.explanation;
INSERT INTO question_options (id, question_id, option_index, option_text, is_correct) VALUES
('fin2_q30_opt_0', 'fin2_q30', 0, 'A. Today, villagers travel farther than they did in the past.', TRUE),
('fin2_q30_opt_1', 'fin2_q30', 1, 'B. Today, villagers travel more far than they did in the past.', FALSE),
('fin2_q30_opt_2', 'fin2_q30', 2, 'C. Today, villagers travel less far than they did in the past.', FALSE),
('fin2_q30_opt_3', 'fin2_q30', 3, 'D. In the past, villagers travelled farther than they do today.', FALSE)
ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct;

